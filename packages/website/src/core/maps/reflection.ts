import {
  Box3,
  DepthTexture,
  Frustum,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Plane,
  ShaderMaterial,
  SkinnedMesh,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderTarget,
  type Camera,
  type Object3D,
  type WebGLRenderer,
} from "three";
import { mapTime } from "./materials";

const RESOLUTION_SCALE = 0.5;
const REFRACTION_SCALE = 0.25;
const REFRACTION_MARGIN = 2;
const LEVEL_PRECISION = 0.5;
const CLIP_BIAS = 0.003;
const TEXTURE_BIAS = new Matrix4().set(
  0.5,
  0,
  0,
  0.5,
  0,
  0.5,
  0,
  0.5,
  0,
  0,
  0.5,
  0.5,
  0,
  0,
  0,
  1,
);

interface WaterLevel {
  localPlane: Plane;
  localBounds: Box3[];
  plane: Plane;
  bounds: Box3[];
  meshes: Mesh[];
  target: WebGLRenderTarget;
  matrix: Matrix4;
}

const camera = new PerspectiveCamera();
const frustum = new Frustum();
const projectionView = new Matrix4();
const size = new Vector2();
const cameraPosition = new Vector3();
const lookAt = new Vector3();
const view = new Vector3();
const target = new Vector3();
const point = new Vector3();
const rotation = new Matrix4();
const clipPlane = new Vector4();
const viewPlane = new Plane();
const q = new Vector4();

export function createReflections(scene: Object3D) {
  scene.updateMatrixWorld(true);

  const sceneInverse = scene.matrixWorld.clone().invert();
  const levels = new Map<number, WaterLevel>();
  const hidden: Object3D[] = [];
  const refraction = new WebGLRenderTarget(1, 1, {
    depthTexture: new DepthTexture(1, 1),
  });
  const refractionCamera = { value: new Vector2() };

  scene.traverse((object) => {
    if (object.userData.reflect === false) hidden.push(object);
    if (!(object instanceof Mesh) || !object.material.userData?.water) return;

    const box = new Box3().setFromObject(object).applyMatrix4(sceneInverse);
    const plane = new Plane().setFromNormalAndCoplanarPoint(
      new Vector3(0, 0, 1),
      box.getCenter(point).setZ(box.max.z),
    );
    const key = Math.round(plane.constant / LEVEL_PRECISION);

    if (!levels.has(key)) {
      levels.set(key, {
        localPlane: plane,
        localBounds: [],
        plane: new Plane(),
        bounds: [],
        meshes: [],
        target: new WebGLRenderTarget(1, 1),
        matrix: new Matrix4(),
      });
    }

    const level = levels.get(key)!;
    const material = (object.material as ShaderMaterial).clone();

    material.uniforms.time = mapTime;
    material.uniforms.sunDirection = (
      object.material as ShaderMaterial
    ).uniforms.sunDirection;
    material.uniforms.reflectionMap.value = level.target.texture;
    material.uniforms.reflectionMatrix.value = level.matrix;
    material.uniforms.refractionMap.value = refraction.texture;
    material.uniforms.refractionDepth.value = refraction.depthTexture;
    material.uniforms.refractionCamera = refractionCamera;
    material.defines.COASTLINE = "";
    object.material = material;
    level.meshes.push(object);
    level.localBounds.push(box);
    level.bounds.push(new Box3());
  });

  const highestLevel = Math.max(
    ...[...levels.values()].map(({ localPlane }) => -localPlane.constant),
  );
  const aboveWater: Object3D[] = [];

  scene.traverse((object) => {
    if (!(object instanceof Mesh) || object instanceof SkinnedMesh) return;
    if (object.userData.reflect === false) return;

    const box = new Box3().setFromObject(object).applyMatrix4(sceneInverse);

    if (box.min.z > highestLevel + REFRACTION_MARGIN) aboveWater.push(object);
  });

  const passCopies = new Map<
    ShaderMaterial,
    { copy: ShaderMaterial; version: number }
  >();
  const passMeshes: [Mesh, ShaderMaterial][] = [];

  scene.traverse((object) => {
    if (!(object instanceof Mesh) || object.userData.reflect === false) return;
    if (!object.visible || !(object.material instanceof ShaderMaterial)) return;

    const source = object.material;

    if (!passCopies.has(source)) {
      const copy = source.clone();

      copy.uniforms = source.uniforms;
      copy.defines = source.defines;
      passCopies.set(source, { copy, version: source.version });
    }

    passMeshes.push([object, source]);
  });

  function swapPassMaterials(pass: boolean) {
    for (const [mesh, source] of passMeshes) {
      const entry = passCopies.get(source)!;

      if (pass && mesh.material === source) {
        if (entry.version !== source.version) {
          entry.version = source.version;
          entry.copy.needsUpdate = true;
        }

        mesh.material = entry.copy;
      } else if (!pass && mesh.material === entry.copy) {
        mesh.material = source;
      }
    }
  }

  function renderPass(
    renderer: WebGLRenderer,
    root: Object3D,
    target: WebGLRenderTarget,
    passCamera: Camera,
  ) {
    const previousTarget = renderer.getRenderTarget();
    const shadowAutoUpdate = renderer.shadowMap.autoUpdate;
    const shadowNeedsUpdate = renderer.shadowMap.needsUpdate;

    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = false;
    swapPassMaterials(true);
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(root, passCamera);
    renderer.setRenderTarget(previousTarget);
    swapPassMaterials(false);
    renderer.shadowMap.autoUpdate = shadowAutoUpdate;
    renderer.shadowMap.needsUpdate = shadowNeedsUpdate;
  }

  return {
    update(renderer: WebGLRenderer, root: Object3D, main: Camera) {
      if (levels.size === 0) return;

      scene.updateWorldMatrix(true, false);

      renderer
        .getDrawingBufferSize(size)
        .multiplyScalar(RESOLUTION_SCALE)
        .floor();
      main.getWorldPosition(cameraPosition);
      projectionView.multiplyMatrices(
        main.projectionMatrix,
        main.matrixWorldInverse,
      );
      frustum.setFromProjectionMatrix(projectionView);

      let anyVisible = false;

      for (const level of levels.values()) {
        const { plane } = level;

        plane.copy(level.localPlane).applyMatrix4(scene.matrixWorld);
        level.bounds.forEach((box, index) =>
          box.copy(level.localBounds[index]).applyMatrix4(scene.matrixWorld),
        );

        if (plane.distanceToPoint(cameraPosition) <= 0) continue;
        if (!level.bounds.some((box) => frustum.intersectsBox(box))) continue;

        anyVisible = true;

        if (level.target.width !== size.x || level.target.height !== size.y) {
          level.target.setSize(size.x, size.y);
        }

        plane.coplanarPoint(point);
        view
          .subVectors(point, cameraPosition)
          .reflect(plane.normal)
          .negate()
          .add(point);
        rotation.extractRotation(main.matrixWorld);
        lookAt.set(0, 0, -1).applyMatrix4(rotation).add(cameraPosition);
        target
          .subVectors(point, lookAt)
          .reflect(plane.normal)
          .negate()
          .add(point);

        camera.position.copy(view);
        camera.up.set(0, 1, 0).applyMatrix4(rotation).reflect(plane.normal);
        camera.lookAt(target);
        camera.updateMatrixWorld();
        camera.projectionMatrix.copy(main.projectionMatrix);

        level.matrix
          .copy(TEXTURE_BIAS)
          .multiply(camera.projectionMatrix)
          .multiply(camera.matrixWorldInverse);

        viewPlane.copy(plane).applyMatrix4(camera.matrixWorldInverse);
        clipPlane.set(
          viewPlane.normal.x,
          viewPlane.normal.y,
          viewPlane.normal.z,
          viewPlane.constant,
        );

        const projection = camera.projectionMatrix.elements;

        q.set(
          (Math.sign(clipPlane.x) + projection[8]) / projection[0],
          (Math.sign(clipPlane.y) + projection[9]) / projection[5],
          -1,
          (1 + projection[10]) / projection[14],
        );
        clipPlane.multiplyScalar(2 / clipPlane.dot(q));
        projection[2] = clipPlane.x;
        projection[6] = clipPlane.y;
        projection[10] = clipPlane.z + 1 - CLIP_BIAS;
        projection[14] = clipPlane.w;
        camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

        const visibility = hidden.map((object) => object.visible);
        const meshVisibility = level.meshes.map((mesh) => mesh.visible);

        hidden.forEach((object) => (object.visible = false));
        level.meshes.forEach((mesh) => (mesh.visible = false));
        renderPass(renderer, root, level.target, camera);
        hidden.forEach((object, index) => (object.visible = visibility[index]));
        level.meshes.forEach(
          (mesh, index) => (mesh.visible = meshVisibility[index]),
        );
      }

      if (!anyVisible) return;

      renderer
        .getDrawingBufferSize(size)
        .multiplyScalar(REFRACTION_SCALE)
        .floor();

      if (refraction.width !== size.x || refraction.height !== size.y) {
        refraction.setSize(size.x, size.y);
      }

      const { near, far } = main as PerspectiveCamera;
      const refractionHidden = [...hidden, ...aboveWater];
      const visibility = refractionHidden.map((object) => object.visible);

      refractionCamera.value.set(near, far);
      refractionHidden.forEach((object) => (object.visible = false));
      renderPass(renderer, root, refraction, main);
      refractionHidden.forEach(
        (object, index) => (object.visible = visibility[index]),
      );
    },

    dispose() {
      for (const level of levels.values()) level.target.dispose();
      refraction.depthTexture?.dispose();
      refraction.dispose();
    },
  };
}
