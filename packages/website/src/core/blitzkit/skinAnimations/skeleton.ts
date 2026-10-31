import { VertexAttribute, type Component } from "@blitzkit/core";
import type { AbstractVFS } from "@blitzkit/core/src/blitzkit/vfs/abstract";
import {
  MathUtils,
  type Buffer,
  type Document,
  type mat4,
  type Node,
  type Primitive,
  type Skin,
  type TypedArray,
  type vec3,
  type vec4,
} from "@gltf-transform/core";
import { isEqual, times } from "lodash-es";
import { dirname, normalize } from "path/posix";
import { Matrix4 } from "three";
import { MotionChannel, MotionReadStream, type Motion } from "./motion";

type SkeletonComponent = Extract<
  Component,
  { "comp.typename": "SkeletonComponent" }
>;
type MotionComponent = Extract<
  Component,
  { "comp.typename": "MotionComponent" }
>;
type AccessorType = "SCALAR" | "VEC3" | "VEC4" | "MAT4";

const JOINT_ROOT = 0xffffff;
const MOTION_PATHS = {
  [MotionChannel.Translation]: "translation",
  [MotionChannel.Rotation]: "rotation",
  [MotionChannel.Scale]: "scale",
} as const;

function createAccessor(
  document: Document,
  buffer: Buffer,
  type: AccessorType,
  array: TypedArray,
) {
  return document
    .createAccessor()
    .setType(type)
    .setArray(array)
    .setBuffer(buffer);
}

export async function loadMotion(
  vfs: AbstractVFS,
  path: string,
  component: MotionComponent,
) {
  const file = await vfs.file(
    normalize(`Data/3d/${dirname(path)}/${component["motion.filepath"]}`),
  );

  return new MotionReadStream(
    file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength,
    ) as ArrayBuffer,
  ).motion();
}

export function createSkeleton(
  document: Document,
  buffer: Buffer,
  node: Node,
  skeleton: SkeletonComponent,
  motion: Motion | undefined,
) {
  const joints = times(
    skeleton.jointsCount,
    (index) => skeleton.joints[index.toString().padStart(4, "0")],
  );
  const jointNodes = joints.map((joint) => {
    const translation: vec3 = [0, 0, 0];
    const rotation: vec4 = [0, 0, 0, 1];
    const scale: vec3 = [1, 1, 1];
    const track = motion?.tracks.get(joint["joint.uid"]);
    const trackScale = track?.get(MotionChannel.Scale)?.values[0];

    MathUtils.decompose(
      joint["joint.bindPose"].flat() as mat4,
      translation,
      rotation,
      scale,
    );

    // rest on the first frame so the static pose matches the animation
    return document
      .createNode(joint["joint.name"])
      .setTranslation(
        (track?.get(MotionChannel.Translation)?.values.slice(0, 3) as vec3) ??
          translation,
      )
      .setRotation(
        (track?.get(MotionChannel.Rotation)?.values.slice(0, 4) as vec4) ??
          rotation,
      )
      .setScale(
        trackScale === undefined ? scale : [trackScale, trackScale, trackScale],
      );
  });

  joints.forEach((joint, index) => {
    const parent = joint["joint.parentIndex"];

    (parent === JOINT_ROOT ? node : jointNodes[parent]).addChild(
      jointNodes[index],
    );
  });

  const skin = document
    .createSkin()
    .setInverseBindMatrices(
      createAccessor(
        document,
        buffer,
        "MAT4",
        new Float32Array(
          joints.flatMap((joint) => joint["joint.invBindPose"].flat()),
        ),
      ),
    );

  jointNodes.forEach((jointNode) => skin.addJoint(jointNode));

  return {
    skin,
    joints: new Map(
      joints.map((joint, index) => [joint["joint.uid"], jointNodes[index]]),
    ),
  };
}

export function createMotionClip(
  document: Document,
  buffer: Buffer,
  clip: string,
  joints: Map<string, Node>,
  motion: Motion,
  component: MotionComponent,
) {
  const animation = document.createAnimation(clip);
  const playbackRate = component["motion.playbackRate"];

  for (const [uid, track] of motion.tracks) {
    const joint = joints.get(uid);

    if (!joint) continue;

    for (const [type, { times, values }] of track) {
      const sampler = document
        .createAnimationSampler()
        .setInput(
          createAccessor(
            document,
            buffer,
            "SCALAR",
            new Float32Array(times.map((time) => time / playbackRate)),
          ),
        )
        .setOutput(
          createAccessor(
            document,
            buffer,
            type === MotionChannel.Rotation ? "VEC4" : "VEC3",
            new Float32Array(
              type === MotionChannel.Scale
                ? values.flatMap((value) => [value, value, value])
                : values,
            ),
          ),
        )
        .setInterpolation("LINEAR");

      animation
        .addSampler(sampler)
        .addChannel(
          document
            .createAnimationChannel()
            .setTargetNode(joint)
            .setTargetPath(MOTION_PATHS[type])
            .setSampler(sampler),
        );
    }
  }
}

/**
 * Makes a socket follow a joint. Socket content is authored in the owner's
 * space, so it follows the joint's movement away from its bind pose.
 */
export function bindSocket(socket: Node, joint: Node, skin: Skin) {
  const index = skin.listJoints().indexOf(joint);
  const inverseBind = skin
    .getInverseBindMatrices()!
    .getElement(index, []) as number[];

  joint.addChild(socket);
  socket.setMatrix(
    new Matrix4()
      .fromArray(inverseBind)
      .multiply(new Matrix4().fromArray(socket.getMatrix()))
      .toArray() as mat4,
  );
  socket.traverse((child) => {
    const childSkin = child.getSkin();

    // skinned meshes carrying a copy of the owner's skeleton deform with it
    if (
      childSkin &&
      isEqual(
        childSkin.listJoints().map((joint) => joint.getName()),
        skin.listJoints().map((joint) => joint.getName()),
      )
    ) {
      child.setSkin(skin);
    }
  });
}

export function skinPrimitive(
  document: Document,
  buffer: Buffer,
  primitive: Primitive,
  attributes: Map<VertexAttribute, number[][]>,
  targetsData: ArrayBuffer | undefined,
) {
  const jointIndices =
    attributes.get(VertexAttribute.JOINTINDEX) ??
    attributes.get(VertexAttribute.HARD_JOINTINDEX);

  if (!jointIndices || !targetsData) return false;

  const targets = new Uint32Array(new Uint8Array(targetsData).slice().buffer);
  const weights =
    attributes.get(VertexAttribute.JOINTWEIGHT) ?? jointIndices.map(() => [1]);

  primitive
    .setAttribute(
      "JOINTS_0",
      createAccessor(
        document,
        buffer,
        "VEC4",
        new Uint16Array(
          jointIndices.flatMap((indices) =>
            times(4, (index) => {
              if (index >= indices.length) return 0;

              const target = targets[indices[index]];

              if (target === undefined) {
                throw new Error(`Missing joint target ${indices[index]}`);
              }

              return target;
            }),
          ),
        ),
      ),
    )
    .setAttribute(
      "WEIGHTS_0",
      createAccessor(
        document,
        buffer,
        "VEC4",
        new Float32Array(
          weights.flatMap((vertexWeights) => {
            const padded = times(4, (index) => vertexWeights[index] ?? 0);
            // some game weights sum below 1; glTF requires normalized weights
            const sum = padded.reduce((total, weight) => total + weight, 0);

            return padded.map((weight) => (sum > 0 ? weight / sum : weight));
          }),
        ),
      ),
    );

  return true;
}
