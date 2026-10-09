import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Box3, Mesh, Vector3, type Object3D } from "three";
import { createAnimations } from "../../../../../../core/maps/animations";
import { createBatches } from "../../../../../../core/maps/batching";
import type { MapSceneExtras } from "../../../../../../core/maps/extras";
import {
  convertMaterials,
  mapTime,
  SHADOW_COLOR,
  SUN_DIRECTION,
  VEGETATION_COLLISION_TYPE,
} from "../../../../../../core/maps/materials";
import { createParticleSystem } from "../../../../../../core/maps/particles";
import { createReflections } from "../../../../../../core/maps/reflection";
import { useMapModel } from "../../../../../../hooks/useMapModel";
import { Maps } from "../../../../../../stores/maps";
import { DEFAULT_EXTENT } from "../constants";

const INSIDE_VEGETATION_FADE = 0.3;

interface VegetationVolume {
  box: Box3;
  meshes: Object3D[];
  inside: boolean;
}

function collectVegetation(scene: Object3D) {
  const volumes: VegetationVolume[] = [];

  scene.updateWorldMatrix(true, true);
  scene.traverse((object) => {
    if (object.userData.collision !== VEGETATION_COLLISION_TYPE) return;

    const meshes: Object3D[] = [];

    object.traverse((child) => {
      if (child instanceof Mesh) meshes.push(child);
    });

    if (meshes.length === 0) return;

    volumes.push({
      box: new Box3().setFromObject(object),
      meshes,
      inside: false,
    });
  });

  return volumes;
}

export function MapModel({ id }: { id: number }) {
  const gltf = useMapModel(id);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const particles = useRef<ReturnType<typeof createParticleSystem>>(null);
  const batches = useRef<ReturnType<typeof createBatches>>(null);
  const animations = useRef<ReturnType<typeof createAnimations>>(null);
  const reflections = useRef<ReturnType<typeof createReflections>>(null);
  const vegetation = useRef<VegetationVolume[]>([]);

  const info = gltf.scene.userData as MapSceneExtras;
  const [minX, minY, , maxX, maxY] = info.mapBounds ?? [
    -DEFAULT_EXTENT,
    -DEFAULT_EXTENT,
    0,
    DEFAULT_EXTENT,
    DEFAULT_EXTENT,
  ];
  const extent = Math.max(
    Math.abs(minX),
    Math.abs(minY),
    Math.abs(maxX),
    Math.abs(maxY),
  );
  const [sunX, sunY, sunZ] = info.sunDirection ?? [0.5, 0.5, 0.707];
  const sunPosition = new Vector3(sunX, sunZ, -sunY)
    .normalize()
    .multiplyScalar(extent * 3);

  useEffect(() => {
    if (info.shadowColor)
      SHADOW_COLOR.set(...(info.shadowColor as [number, number, number]));

    SUN_DIRECTION.set(sunX, sunY, sunZ).normalize();

    Maps.mutate((draft) => {
      draft.revealed = true;
      draft.extent = extent;
    });
  }, [gltf]);

  useEffect(() => {
    convertMaterials(gltf.scene);
    particles.current = createParticleSystem(gltf.scene);
    vegetation.current = collectVegetation(gltf.scene);
    batches.current = createBatches(gltf.scene);
    animations.current = createAnimations(
      gltf.scene,
      gltf.animations,
      batches.current,
    );
    reflections.current = createReflections(gltf.scene);
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    scene.matrixWorldAutoUpdate = false;

    return () => {
      particles.current?.dispose();
      animations.current?.dispose();
      batches.current?.dispose();
      reflections.current?.dispose();
      gl.shadowMap.autoUpdate = true;
      scene.matrixWorldAutoUpdate = true;
    };
  }, [gltf]);

  useFrame(({ clock, camera, scene }, delta) => {
    mapTime.value = clock.elapsedTime;
    particles.current?.update(delta);

    for (const volume of vegetation.current) {
      const inside = volume.box.containsPoint(camera.position);

      if (inside === volume.inside) continue;

      volume.inside = inside;
      batches.current?.setFade(
        volume.meshes,
        inside ? INSIDE_VEGETATION_FADE : 1,
      );
    }

    if (batches.current?.update(camera)) gl.shadowMap.needsUpdate = true;
    if (animations.current?.update(delta)) gl.shadowMap.needsUpdate = true;

    camera.updateMatrixWorld();
    scene.updateMatrixWorld();
    reflections.current?.update(gl, scene, camera);
  });

  return (
    <>
      <directionalLight
        castShadow
        position={sunPosition}
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0005}
        shadow-camera-left={-extent * 1.2}
        shadow-camera-right={extent * 1.2}
        shadow-camera-top={extent * 1.2}
        shadow-camera-bottom={-extent * 1.2}
        shadow-camera-near={1}
        shadow-camera-far={extent * 6}
      />

      <group rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={gltf.scene} />
      </group>
    </>
  );
}
