import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import styles from "./index.module.css";
import { GLTFLoader } from "three-stdlib";
import { Tankopedia } from "../../stores/tankopedia";
import { TankopediaTab } from "../../stores/tankopedia";

export function TankopediaSandbox() {
  const isVisible = Tankopedia.use((state) => state.tab === TankopediaTab.Tank);

  return (
    <div className={styles.sandbox} data-visible={isVisible}>
      <Canvas
        shadows
        className={styles.canvas}
        frameloop={isVisible ? "always" : "never"}
      >
        {!import.meta.env.SSR && <Content />}
      </Canvas>
    </div>
  );
}

function Content() {
  const gltf = useLoader(GLTFLoader, "/amogos.glb");

  return (
    <>
      <group scale={4}>
        <primitive object={gltf.scene} />
      </group>

      <ambientLight />
      <pointLight castShadow position={[3, 10, 5]} intensity={1000} />

      <mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="green" />
      </mesh>

      <OrbitControls />
    </>
  );
}
