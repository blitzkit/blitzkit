import { OrbitControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { FogExp2 } from "three";
import { GLTFLoader } from "three-stdlib";
import styles from "./index.module.css";

export function TankopediaSandbox() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sandbox}>
        <Canvas
          scene={{ fog: new FogExp2("black", 0.05) }}
          shadows
          className={styles.canvas}
          frameloop="demand"
        >
          {!import.meta.env.SSR && <Content />}
        </Canvas>
      </div>
    </div>
  );
}

function Content() {
  const gltf = useLoader(GLTFLoader, "/amogos.glb");

  gltf.scene.traverse(child =>
  {
    child.castShadow = true;
    })

  return (
    <>
      <group scale={4}>
        <primitive object={gltf.scene} />
      </group>

      <ambientLight />
      <pointLight castShadow position={[3, 10, 5]} intensity={1000} />

      <mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2 ** 8, 2 ** 8]} />
        <meshStandardMaterial color="black" />
      </mesh>

      <OrbitControls />
    </>
  );
}
