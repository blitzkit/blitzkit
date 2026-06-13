import {
  VisualChanges_TankPart,
  type StageParameters,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useProtagonist } from "../../hooks/useProtagonist";
import { useTankChassisModel } from "../../hooks/useTankChassisModel";
import { useTankHullModel } from "../../hooks/useTankHullModel";
import { useTankModel } from "../../hooks/useTankModel";
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

  const collision = false;

  const hull = useTankHullModel();
  const chassis = useTankChassisModel();
  const turret = useTankModel(`/models/tanks/${tank.id}/${selectedTurret}.glb`);
  const gun = useTankModel(`/models/tanks/${tank.id}/${selectedGun}.glb`);

  return (
    <>
      <group>
        <primitive object={chassis} />
        <primitive object={hull} />
      </group>

      <group position={[0, 0, 5]}>
        <primitive object={turret} />
      </group>

      <group position={[0, 0, -5]}>
        <primitive object={gun} />
      </group>

      <spotLight
        castShadow
        position={[3, 10, 5]}
        intensity={2 ** 10}
        penumbra={1}
      />
      <spotLight
        castShadow
        position={[-3, -10, -5]}
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
