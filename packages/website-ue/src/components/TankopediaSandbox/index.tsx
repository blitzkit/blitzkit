import { OrbitControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { Mesh, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three-stdlib";
import styles from "./index.module.css";

export function TankopediaSandbox() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sandbox}>
        <Canvas
          // scene={{ fog: new FogExp2("black", 0.05) }}
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
  const gltf = useLoader(
    GLTFLoader,
    "/models/tanks/TankEntity.A128_Concept_1b/hull.glb",
  );

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

  return (
    <>
      <group>
        <primitive object={gltf.scene} />
      </group>

      <spotLight
        castShadow
        position={[3, 10, 5]}
        intensity={2 ** 10}
        penumbra={1}
      />
      <ambientLight />

      <mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2 ** 8, 2 ** 8]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      <OrbitControls />
    </>
  );
}
