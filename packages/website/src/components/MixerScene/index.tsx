import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Lighting } from "../Tankopedia/HeroSection/components/TankSandbox/components/Lighting";
import { SceneProps } from "../Tankopedia/HeroSection/components/TankSandbox/components/SceneProps";
import { MixerFallback } from "./components/MixerFallback";
import { Model } from "./components/Model";

export function MixerScene() {
  return (
    <Canvas
      shadows="soft"
      style={{ background: "black" }}
      camera={{
        fov: 45,
        position: [-4, 4, -7],
      }}
    >
      <OrbitControls
        maxDistance={20}
        minDistance={5}
        enableDamping={false}
        target={[0, 0.5, 0]}
      />

      <Lighting />
      <SceneProps />

      <Suspense fallback={<MixerFallback />}>
        <Model />
      </Suspense>
    </Canvas>
  );
}
