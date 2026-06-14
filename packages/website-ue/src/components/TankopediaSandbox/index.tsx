import { type StageParameters } from "@protos/blitz_static_tank_upgrade_single_stage";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useTankChassisModel } from "../../hooks/useTankChassisModel";
import { useTankGunModel } from "../../hooks/useTankGunModel";
import { useTankHullModel } from "../../hooks/useTankHullModel";
import { useTankTurretModel } from "../../hooks/useTankTurretModel";
import { TankopediaLighting } from "../TankopediaLighting";
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

      <group position={[19.515463 / 100, 129.6958 / 100, 0.0039617573 / 100]}>
        <primitive object={turret} />
      </group>

      <group position={[154.39078 / 100, 178.7401 / 100, 0.11611016 / 100]}>
        <primitive object={gun} />
      </group>

      <TankopediaLighting />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2 ** 9, 2 ** 9]} />
        <meshStandardMaterial color="black" />
      </mesh>

      <OrbitControls />
    </>
  );
}
