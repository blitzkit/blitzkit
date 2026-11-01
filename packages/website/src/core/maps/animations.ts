import {
  Bone,
  Matrix4,
  Mesh,
  Quaternion,
  SkinnedMesh,
  Vector3,
  type AnimationClip,
  type Interpolant,
  type Object3D,
} from "three";
import type { createBatches } from "./batching";
import type { MapAnimationInfo, MapVisibility } from "./extras";
import { hasAncestorValue } from "./materials";

interface NodeAnimation {
  node: Object3D;
  rest: Matrix4;
  restPosition: Vector3;
  restQuaternion: Quaternion;
  restScale: Vector3;
  start: number;
  length: number;
  duration: number;
  speed: number;
  rewind: boolean;
  absolute: boolean;
  translation: Interpolant | undefined;
  rotation: Interpolant | undefined;
  scale: Interpolant | undefined;
  parent: NodeAnimation | undefined;
  parentOffset: Matrix4;
  meshes: [mesh: Object3D, offset: Matrix4][];
  castShadow: boolean;
  relative: Matrix4;
  moved: boolean;
  finished: boolean;
}

interface VisibilityTimeline {
  node: Object3D;
  changes: [time: number, visible: boolean][];
  next: number;
}

const keyPosition = new Vector3();
const keyQuaternion = new Quaternion();
const keyScale = new Vector3();
const local = new Matrix4();
const matrix = new Matrix4();

export function createAnimations(
  scene: Object3D,
  clips: AnimationClip[],
  batches: ReturnType<typeof createBatches>,
) {
  scene.updateMatrixWorld(true);

  const sceneInverse = scene.matrixWorld.clone().invert();
  const animations: NodeAnimation[] = [];
  const byNode = new Map<Object3D, NodeAnimation>();
  const groupStarts = new Map<string, number>();
  const timelines: VisibilityTimeline[] = [];

  scene.traverse((node) => {
    if (node instanceof SkinnedMesh) node.frustumCulled = false;

    const visibility = node.userData.visibility as MapVisibility | undefined;

    if (visibility) {
      batches.setHidden(node, !visibility.initial);
      timelines.push({ node, changes: visibility.changes, next: 0 });
    }

    const info = node.userData.animation as MapAnimationInfo | undefined;
    const clip =
      info && clips.find((candidate) => candidate.name === info.clip);

    if (!info || !clip || !node.parent) return;

    const interpolant = (property: string) =>
      clip.tracks
        .find((track) => track.name.endsWith(`.${property}`))
        ?.InterpolantFactoryMethodLinear();
    const nodeInverse = node.matrixWorld.clone().invert();
    const meshes: NodeAnimation["meshes"] = [];
    let parent: NodeAnimation | undefined;
    let castShadow =
      node instanceof Bone && hasAncestorValue(node, "castShadow", true);

    for (
      let ancestor: Object3D | null = node.parent;
      ancestor && !parent;
      ancestor = ancestor.parent
    ) {
      parent = byNode.get(ancestor);
    }

    node.traverse((child) => {
      if (!(child instanceof Mesh)) return;

      meshes.push([child, nodeInverse.clone().multiply(child.matrixWorld)]);
      castShadow ||= child.castShadow;
    });

    const start =
      (info.group ? groupStarts.get(info.group) : undefined) ??
      info.delay + Math.random() * info.delayVariation;

    if (info.group) groupStarts.set(info.group, start);

    const parentOffset = parent
      ? parent.node.matrixWorld
          .clone()
          .invert()
          .multiply(node.parent.matrixWorld)
      : sceneInverse.clone().multiply(node.parent.matrixWorld);
    const animation: NodeAnimation = {
      node,
      rest: node.matrix.clone(),
      restPosition: node.position.clone(),
      restQuaternion: node.quaternion.clone(),
      restScale: node.scale.clone(),
      start,
      length: info.repeats === null ? Infinity : info.duration * info.repeats,
      duration: info.duration,
      speed: info.speed,
      rewind: !!info.rewind,
      absolute: !!info.absolute,
      translation: interpolant("position"),
      rotation: interpolant("quaternion"),
      scale: interpolant("scale"),
      parent,
      parentOffset,
      meshes,
      castShadow,
      relative: sceneInverse.clone().multiply(node.matrixWorld),
      moved: false,
      finished: false,
    };

    animations.push(animation);
    byNode.set(node, animation);
  });

  scene.traverse((object) => {
    object.matrixAutoUpdate = byNode.has(object);
  });

  let elapsed = 0;

  return {
    update(delta: number) {
      let castShadow = false;

      elapsed += delta;

      for (const timeline of timelines) {
        while (
          timeline.next < timeline.changes.length &&
          timeline.changes[timeline.next][0] <= elapsed
        ) {
          batches.setHidden(timeline.node, !timeline.changes[timeline.next][1]);
          timeline.next++;
          castShadow = true;
        }
      }

      for (const animation of animations) {
        const parentMoved = animation.parent?.moved ?? false;

        animation.moved = false;

        if ((elapsed < animation.start || animation.finished) && !parentMoved) {
          continue;
        }

        const time = Math.max(0, elapsed - animation.start) * animation.speed;

        animation.finished = time >= animation.length;

        const keyTime = animation.finished
          ? animation.rewind
            ? 0
            : animation.duration
          : time % animation.duration;
        const { translation, rotation, scale } = animation;

        if (animation.absolute) {
          keyPosition.copy(animation.restPosition);
          keyQuaternion.copy(animation.restQuaternion);
          keyScale.copy(animation.restScale);
        } else {
          keyPosition.set(0, 0, 0);
          keyQuaternion.identity();
          keyScale.set(1, 1, 1);
        }

        if (translation) keyPosition.fromArray(translation.evaluate(keyTime));
        if (rotation) keyQuaternion.fromArray(rotation.evaluate(keyTime));
        if (scale) keyScale.fromArray(scale.evaluate(keyTime));

        local.compose(keyPosition, keyQuaternion, keyScale);

        if (!animation.absolute) local.premultiply(animation.rest);

        local.decompose(
          animation.node.position,
          animation.node.quaternion,
          animation.node.scale,
        );

        if (animation.parent) {
          animation.relative.multiplyMatrices(
            animation.parent.relative,
            animation.parentOffset,
          );
        } else {
          animation.relative.copy(animation.parentOffset);
        }

        animation.relative.multiply(local);

        for (const [mesh, offset] of animation.meshes) {
          batches.setMatrix(
            mesh,
            matrix.multiplyMatrices(animation.relative, offset),
          );
        }

        animation.moved = true;
        castShadow ||= animation.castShadow;
      }

      return castShadow;
    },

    dispose() {
      scene.traverse((object) => {
        object.matrixAutoUpdate = true;
      });

      for (const timeline of timelines) timeline.node.visible = true;

      for (const animation of animations) {
        animation.rest.decompose(
          animation.node.position,
          animation.node.quaternion,
          animation.node.scale,
        );
      }
    },
  };
}
