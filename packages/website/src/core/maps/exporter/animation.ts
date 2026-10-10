import {
  MotionChannel,
  MotionReadStream,
  type Hierarchy,
  type Motion,
} from "@blitzkit/core";
import {
  MathUtils,
  type Accessor,
  type mat4,
  type Node,
  type vec3,
  type vec4,
} from "@gltf-transform/core";
import { times } from "lodash-es";
import { normalize } from "path/posix";
import { vfs } from "../../blitzkit/vfs";
import type { MapAnimationInfo } from "../extras";
import {
  addExtras,
  createAccessor,
  type DataNode,
  type MapContext,
} from "./context";
import {
  findComponent,
  hierarchyComponents,
  indexedEntries,
  visitHierarchies,
  type MapComponent,
} from "./hierarchy";

type AnimationPath = "translation" | "rotation" | "scale";

export interface ActionStart {
  action: MapComponent;
  time: number;
}

const INFINITE_REPEATS = 0xffffffff;
const JOINT_ROOT = 0xffffff;
const MOTION_PATHS: Record<MotionChannel, AnimationPath> = {
  [MotionChannel.Translation]: "translation",
  [MotionChannel.Rotation]: "rotation",
  [MotionChannel.Scale]: "scale",
};

export function motionPath({ directory }: MapContext, component: MapComponent) {
  return normalize(`Data/3d/${directory}/${component["motion.filepath"]}`);
}

export async function loadMotions(
  context: MapContext,
  hierarchies: Hierarchy[],
) {
  const paths = new Set<string>();
  const motions = new Map<string, Motion>();

  visitHierarchies(hierarchies, (hierarchy) => {
    for (const component of hierarchyComponents(hierarchy)) {
      if (component["comp.typename"] === "MotionComponent") {
        paths.add(motionPath(context, component));
      }
    }
  });

  for (const path of paths) {
    const file = await vfs.file(path).catch(() => undefined);

    if (file) {
      motions.set(
        path,
        new MotionReadStream(
          file.buffer.slice(
            file.byteOffset,
            file.byteOffset + file.byteLength,
          ) as ArrayBuffer,
        ).motion(),
      );
    }
  }

  return motions;
}

function actionRepeats(action: MapComponent, repeats: number) {
  return action["act.stopAfterNRepeats"] > 0
    ? (action["act.stopAfterNRepeats"] as number)
    : repeats === 0 || repeats >= INFINITE_REPEATS
    ? null
    : repeats;
}

function actionTiming(start: ActionStart, repeats: number) {
  return {
    delay: start.time,
    delayVariation: start.action["act.delayVariation"],
    repeats: actionRepeats(start.action, repeats),
  };
}

export function createAnimator(
  context: MapContext,
  animationData: Map<bigint, DataNode>,
  motions: Map<string, Motion>,
) {
  const { document } = context;
  const samplers = new Map<bigint, Accessor[]>();

  function keyframeAccessors(id: bigint) {
    if (!samplers.has(id)) {
      const data = animationData.get(id)!;
      const keys = times(data.keyCount, (index) => index);

      samplers.set(id, [
        createAccessor(
          context,
          "SCALAR",
          new Float32Array(keys.map((index) => data[`key_${index}_time`])),
        ),
        createAccessor(
          context,
          "VEC3",
          new Float32Array(
            keys.flatMap((index) => data[`key_${index}_translation`]),
          ),
        ),
        createAccessor(
          context,
          "VEC4",
          new Float32Array(
            keys.flatMap((index) => data[`key_${index}_rotation`]),
          ),
        ),
        createAccessor(
          context,
          "VEC3",
          new Float32Array(keys.flatMap((index) => data[`key_${index}_scale`])),
        ),
      ]);
    }

    return samplers.get(id)!;
  }

  function animateNode(
    node: Node,
    channels: [path: AnimationPath, input: Accessor, output: Accessor][],
    info: Omit<MapAnimationInfo, "clip">,
  ) {
    const clip = `animation${document.getRoot().listAnimations().length}`;
    const animation = document.createAnimation(clip);

    for (const [path, input, output] of channels) {
      const sampler = document
        .createAnimationSampler()
        .setInput(input)
        .setOutput(output)
        .setInterpolation("LINEAR");

      animation
        .addSampler(sampler)
        .addChannel(
          document
            .createAnimationChannel()
            .setTargetNode(node)
            .setTargetPath(path)
            .setSampler(sampler),
        );
    }

    addExtras(node, {
      animation: { clip, ...info } satisfies MapAnimationInfo,
    });
  }

  function length(target: Hierarchy, action: MapComponent) {
    const components = hierarchyComponents(target);
    const animation = findComponent(components, "AnimationComponent");
    const motion = findComponent(components, "MotionComponent");
    const [duration, repeats, speed] = animation
      ? [
          animationData.get(BigInt(animation.animation))?.duration,
          actionRepeats(action, animation.repeatsCount),
          animation.animationTimeScale * action["act.motionSpeed"],
        ]
      : motion
      ? [
          motions.get(motionPath(context, motion))?.duration,
          actionRepeats(action, motion["simpleMotion.repeatsCount"]),
          motion["motion.playbackRate"] * action["act.motionSpeed"],
        ]
      : [];

    return duration === undefined ||
      repeats === null ||
      repeats === undefined ||
      speed === undefined
      ? Infinity
      : (duration * repeats) / speed;
  }

  function addKeyframes(
    node: Node,
    component: MapComponent,
    start: ActionStart,
  ) {
    const id = BigInt(component.animation);

    if (!animationData.has(id)) return;

    const [input, translation, rotation, scale] = keyframeAccessors(id);

    animateNode(
      node,
      [
        ["translation", input, translation],
        ["rotation", input, rotation],
        ["scale", input, scale],
      ],
      {
        ...actionTiming(start, component.repeatsCount),
        duration: animationData.get(id)!.duration,
        speed: component.animationTimeScale * start.action["act.motionSpeed"],
      },
    );
  }

  function createSkeleton(
    node: Node,
    hierarchy: Hierarchy,
    skeleton: MapComponent,
    motionComponent: MapComponent,
    start: ActionStart | undefined,
  ) {
    const motion = motions.get(motionPath(context, motionComponent));
    const joints = indexedEntries(skeleton.joints, skeleton.jointsCount);
    const jointNodes = joints.map((joint) => {
      const translation: vec3 = [0, 0, 0];
      const rotation: vec4 = [0, 0, 0, 1];
      const scale: vec3 = [1, 1, 1];
      const track = motion?.tracks.get(joint["joint.uid"]);
      const trackScale = track?.get(MotionChannel.Scale)?.values[0];

      MathUtils.decompose(
        (joint["joint.bindPose"] as number[][]).flat() as mat4,
        translation,
        rotation,
        scale,
      );

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
          trackScale === undefined
            ? scale
            : [trackScale, trackScale, trackScale],
        );
    });

    joints.forEach((joint, index) => {
      const parent = joint["joint.parentIndex"];

      (parent === JOINT_ROOT ? node : jointNodes[parent]).addChild(
        jointNodes[index],
      );
    });

    if (motion && start) {
      joints.forEach((joint, index) => {
        const track = motion.tracks.get(joint["joint.uid"]);

        if (!track) return;

        animateNode(
          jointNodes[index],
          [...track].map(([type, { times, values }]) => [
            MOTION_PATHS[type],
            createAccessor(context, "SCALAR", new Float32Array(times)),
            createAccessor(
              context,
              type === MotionChannel.Rotation ? "VEC4" : "VEC3",
              new Float32Array(
                type === MotionChannel.Scale
                  ? values.flatMap((value) => [value, value, value])
                  : values,
              ),
            ),
          ]),
          {
            ...actionTiming(
              start,
              motionComponent["simpleMotion.repeatsCount"],
            ),
            duration: motion.duration,
            speed:
              motionComponent["motion.playbackRate"] *
              start.action["act.motionSpeed"],
            rewind: motionComponent["simpleMotion.rewindOnFinish"],
            absolute: true,
            group: String(hierarchy.id),
          },
        );
      });
    }

    const skin = document
      .createSkin()
      .setInverseBindMatrices(
        createAccessor(
          context,
          "MAT4",
          new Float32Array(
            joints.flatMap((joint) =>
              (joint["joint.invBindPose"] as number[][]).flat(),
            ),
          ),
        ),
      );

    jointNodes.forEach((jointNode) => skin.addJoint(jointNode));

    return skin;
  }

  return { length, addKeyframes, createSkeleton };
}

export type Animator = ReturnType<typeof createAnimator>;
