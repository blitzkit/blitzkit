import {
  VisualChanges_TankPart,
  type StageParameters,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { Mesh, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three-stdlib";
import { useProtagonist } from "../../hooks/useProtagonist";
import styles from "./index.module.css";

interface TankopediaSandboxProps {
  parameters: StageParameters;
}

export function TankopediaSandbox({ parameters }: TankopediaSandboxProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sandbox}>
        <Canvas
          // scene={{ fog: new FogExp2("black", 0.05) }}
          shadows
          className={styles.canvas}
          frameloop="demand"
        >
          {!import.meta.env.SSR && <Content parameters={parameters} />}
        </Canvas>
      </div>
    </div>
  );
}

function Content({ parameters }: TankopediaSandboxProps) {
  const tank = useProtagonist();

  const selectedTurret = parameters.visual_changes.find(
    ({ tank_part }) => tank_part === VisualChanges_TankPart.TANK_PART_TURRET,
  )!.name;
  const selectedGun = parameters.visual_changes.find(
    ({ tank_part }) => tank_part === VisualChanges_TankPart.TANK_PART_GUN,
  )!.name;

  const hull = useLoader(GLTFLoader, `/models/tanks/${tank.id}/hull.glb`);
  const chassis = useLoader(GLTFLoader, `/models/tanks/${tank.id}/chassis.glb`);

  console.log(chassis);

  const turret = useLoader(
    GLTFLoader,
    `/models/tanks/${tank.id}/${selectedTurret}.glb`,
  );
  const gun = useLoader(
    GLTFLoader,
    `/models/tanks/${tank.id}/${selectedGun}.glb`,
  );

  const gltfs = [turret, gun, hull, chassis];

  for (const gltf of gltfs) {
    gltf.scene.traverse((child) => {
      if (
        child instanceof Mesh &&
        child.material instanceof MeshStandardMaterial
      ) {
        // TODO: remove this hack and fix the gltf
        child.material.vertexColors = false;
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });
  }

  return (
    <>
      <group>
        <primitive object={chassis.scene} />
        <primitive object={hull.scene} />
      </group>

      <group position={[0, 0, 5]}>
        <primitive object={turret.scene} />
      </group>

      <group position={[0, 0, -5]}>
        <primitive object={gun.scene} />
      </group>

      <spotLight
        castShadow
        position={[3, 10, 5]}
        intensity={2 ** 10}
        penumbra={1}
      />
      <ambientLight />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2 ** 8, 2 ** 8]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      <OrbitControls />
    </>
  );
}
