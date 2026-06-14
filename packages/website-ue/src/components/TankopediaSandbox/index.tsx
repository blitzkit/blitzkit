import { type StageParameters } from "@protos/blitz_static_tank_upgrade_single_stage";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useTankChassisModel } from "../../hooks/useTankChassisModel";
import { useTankGunModel } from "../../hooks/useTankGunModel";
import { useTankHullModel } from "../../hooks/useTankHullModel";
import { useTankTurretModel } from "../../hooks/useTankTurretModel";
import { TankopediaLighting } from "../TankopediaLighting";
import { SceneProps } from "../TankopediaSceneProps";
import styles from "./index.module.css";

interface TankopediaSandboxProps {
  parameters: StageParameters;
}

export function TankopediaSandbox({ parameters }: TankopediaSandboxProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sandbox}>
        <Canvas
          camera={{ fov: 40 }}
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
  const hull = useTankHullModel();
  const chassis = useTankChassisModel();
  const turret = useTankTurretModel(parameters);
  const gun = useTankGunModel(parameters);

  return (
    <>
      <group>
        <primitive object={chassis} />
        <primitive object={hull} />
      </group>

      <group>
        <primitive object={turret} />
      </group>

      <group>
        <primitive object={gun} />
      </group>

      <TankopediaLighting />
      <SceneProps />

      <OrbitControls />
    </>
  );
}
