import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { QuicklimeEvent } from "quicklime";
import { forwardRef, Suspense, useEffect, useRef } from "react";
import type { OrbitControls as OrbitControlsClass } from "three-stdlib";
import { controlsEnabledEvent } from "../../core/controlsEnabled";
import { Lighting } from "../Tankopedia/HeroSection/components/TankSandbox/components/Lighting";
import { SceneProps } from "../Tankopedia/HeroSection/components/TankSandbox/components/SceneProps";
import { MixerFallback } from "./components/MixerFallback";
import { Model } from "./components/Model";

export const MixerScene = forwardRef<HTMLCanvasElement>((_, ref) => {
  const controls = useRef<OrbitControlsClass>(null!);

  useEffect(() => {
    function handleControlsEnabled(event: QuicklimeEvent<boolean>) {
      if (!controls.current) return;
      controls.current.enabled = event.data;
    }

    controlsEnabledEvent.on(handleControlsEnabled);

    return () => {
      controlsEnabledEvent.off(handleControlsEnabled);
    };
  }, []);

  return (
    <Canvas
      ref={ref}
      shadows="soft"
      style={{ background: "black" }}
      camera={{
        fov: 45,
        position: [-4, 4, -7],
      }}
    >
      <OrbitControls
        ref={controls}
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
});
