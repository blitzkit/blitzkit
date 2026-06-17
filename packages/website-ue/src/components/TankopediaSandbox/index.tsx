import { type StageParameters } from "@protos/blitz_static_tank_upgrade_single_stage";
import { Canvas } from "@react-three/fiber";
import { fov } from "../../config/camera";
import { RendererStats } from "../RendererStats";
import { TankModelChassis } from "../TankModelChassis";
import { TankModelGun } from "../TankModelGun";
import { TankModelHull } from "../TankModelHull";
import { TankModelTurret } from "../TankModelTurret";
import { TankopediaControls } from "../TankopediaControls";
import { TankopediaLighting } from "../TankopediaLighting";
import { SceneProps } from "../TankopediaSceneProps";
import styles from "./index.module.css";

interface TankopediaSandboxProps {
  parameters: StageParameters;
}

export function TankopediaSandbox({ parameters }: TankopediaSandboxProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sandbox} id="canvas-attach">
        <RendererStats />

        <Canvas
          camera={{ fov }}
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
  return (
    <>
      <TankModelChassis />
      <TankModelHull />
      <TankModelTurret parameters={parameters} />
      <TankModelGun parameters={parameters} />

      {/**/}

      <TankopediaLighting />
      <SceneProps />
      <TankopediaControls />
    </>
  );
}
