import {
  BatchedMesh,
  Color,
  InstancedMesh,
  Matrix4,
  Mesh,
  SkinnedMesh,
  Vector3,
  type BufferGeometry,
  type Camera,
  type Material,
  type Object3D,
} from "three";
import { isBatchable } from "./materials";

type Instance = [batch: BatchedMesh, id: number];

interface LodLevel {
  distance: number;
  node: Object3D;
  instances: Instance[];
}

interface LodRoot {
  position: Vector3;
  levels: LodLevel[];
  hideDistance: number;
  active: number;
}

const HIDDEN_LEVEL = -2;

const color = new Color();
const cameraPosition = new Vector3();
const worldToScene = new Matrix4();

function attributeSignature(geometry: BufferGeometry) {
  return Object.entries(geometry.attributes)
    .map(
      ([name, attribute]) =>
        `${name}:${attribute.itemSize}:${attribute.normalized}`,
    )
    .sort()
    .join(",");
}

export function createBatches(scene: Object3D) {
  scene.updateMatrixWorld(true);

  const sceneInverse = scene.matrixWorld.clone().invert();
  const groups = new Map<string, Mesh[]>();

  scene.traverse((object) => {
    if (
      !(object instanceof Mesh) ||
      object instanceof InstancedMesh ||
      object instanceof SkinnedMesh ||
      !object.visible ||
      !object.geometry.index ||
      !isBatchable(object)
    ) {
      return;
    }

    const material = object.material as Material;
    const key = [
      material.uuid,
      object.customDepthMaterial?.uuid,
      object.castShadow,
      object.receiveShadow,
      attributeSignature(object.geometry),
    ].join("|");

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(object);
  });

  const instances = new Map<Object3D, Instance>();
  const batches: BatchedMesh[] = [];

  for (const meshes of groups.values()) {
    const [first] = meshes;
    const geometries = [...new Set(meshes.map((mesh) => mesh.geometry))];
    const vertexCount = geometries.reduce(
      (sum, geometry) => sum + geometry.getAttribute("position").count,
      0,
    );
    const indexCount = geometries.reduce(
      (sum, geometry) => sum + geometry.index!.count,
      0,
    );
    const batch = new BatchedMesh(
      meshes.length,
      vertexCount,
      indexCount,
      first.material as Material,
    );
    const geometryIds = new Map(
      geometries.map((geometry) => [geometry, batch.addGeometry(geometry)]),
    );
    const matrix = new Matrix4();

    batch.castShadow = first.castShadow;
    batch.receiveShadow = first.receiveShadow;
    batch.customDepthMaterial = first.customDepthMaterial;
    batch.frustumCulled = false;
    batch.perObjectFrustumCulled = false;
    batch.sortObjects = (first.material as Material).transparent;

    for (const mesh of meshes) {
      const id = batch.addInstance(geometryIds.get(mesh.geometry)!);

      batch.setMatrixAt(
        id,
        matrix.multiplyMatrices(sceneInverse, mesh.matrixWorld),
      );
      batch.setColorAt(id, color.setRGB(1, 1, 1));
      instances.set(mesh, [batch, id]);
      mesh.visible = false;
    }

    batches.push(batch);
    scene.add(batch);
  }

  const roots: LodRoot[] = [];

  scene.traverse((object) => {
    const distances = object.userData.lodDistances as number[] | undefined;

    if (!distances) return;

    const levels = object.children
      .filter((child) => child.userData.lod !== undefined)
      .sort((a, b) => a.userData.lod - b.userData.lod)
      .map((node) => {
        const index: number = node.userData.lod;
        const levelInstances: Instance[] = [];

        node.traverse((child) => {
          const instance = instances.get(child);

          if (instance) levelInstances.push(instance);
        });

        return {
          distance: index === 0 ? 0 : distances[index - 1],
          node,
          instances: levelInstances,
        };
      });

    if (levels.length === 0) return;

    roots.push({
      position: object
        .getWorldPosition(new Vector3())
        .applyMatrix4(sceneInverse),
      levels,
      hideDistance: distances[levels[levels.length - 1].node.userData.lod],
      active: -1,
    });
  });

  const lodHidden = new Set<Instance>();
  const stateHidden = new Set<Instance>();

  function applyVisibility(instance: Instance) {
    instance[0].setVisibleAt(
      instance[1],
      !lodHidden.has(instance) && !stateHidden.has(instance),
    );
  }

  function setLevelVisible(level: LodLevel, visible: boolean) {
    level.node.visible = visible;

    for (const instance of level.instances) {
      if (visible) lodHidden.delete(instance);
      else lodHidden.add(instance);

      applyVisibility(instance);
    }
  }

  return {
    update(camera: Camera) {
      let changed = false;

      scene.updateWorldMatrix(true, false);
      camera
        .getWorldPosition(cameraPosition)
        .applyMatrix4(worldToScene.copy(scene.matrixWorld).invert());

      for (const root of roots) {
        const distance = cameraPosition.distanceTo(root.position);
        let active = 0;

        for (let index = 1; index < root.levels.length; index++) {
          if (distance < root.levels[index].distance) break;

          active = index;
        }

        if (distance >= root.hideDistance) active = HIDDEN_LEVEL;

        if (active === root.active) continue;

        if (root.active < 0) {
          root.levels.forEach((level, index) =>
            setLevelVisible(level, index === active),
          );
        } else {
          setLevelVisible(root.levels[root.active], false);
          if (active >= 0) setLevelVisible(root.levels[active], true);
        }

        root.active = active;
        changed = true;
      }

      return changed;
    },

    setFade(meshes: Object3D[], fade: number) {
      for (const mesh of meshes) {
        const instance = instances.get(mesh);

        if (instance)
          instance[0].setColorAt(instance[1], color.setRGB(fade, fade, fade));
      }
    },

    setHidden(root: Object3D, hidden: boolean) {
      root.visible = !hidden;
      root.traverse((child) => {
        const instance = instances.get(child);

        if (!instance) return;
        if (hidden) stateHidden.add(instance);
        else stateHidden.delete(instance);

        applyVisibility(instance);
      });
    },

    setMatrix(mesh: Object3D, matrix: Matrix4) {
      const instance = instances.get(mesh);

      if (instance) instance[0].setMatrixAt(instance[1], matrix);
    },

    dispose() {
      for (const batch of batches) {
        batch.removeFromParent();
        batch.dispose();
      }

      for (const mesh of instances.keys()) mesh.visible = true;

      for (const root of roots) {
        for (const level of root.levels) level.node.visible = true;
      }
    },
  };
}
