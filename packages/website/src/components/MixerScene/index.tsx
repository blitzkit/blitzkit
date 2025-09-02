import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Lighting } from "../Tankopedia/HeroSection/components/TankSandbox/components/Lighting";
import { Model } from "./components/Model";

export function MixerScene() {
  return (
    <Canvas
      shadows="soft"
      camera={{
        fov: 45,
        position: [5, 5, -5],
      }}
    >
      <OrbitControls />

      <Lighting />

      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  );
}
