import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Maps } from "../../../../../stores/maps";
import { AxisGizmo } from "./components/AxisGizmo";
import { Controls } from "./components/Controls";
import { FrameLimiter } from "./components/FrameLimiter";
import { MapModel } from "./components/MapModel";
import { DEFAULT_EXTENT, initialCamera } from "./constants";

const MAX_PIXEL_RATIO = 1.5;

export function MapSandbox() {
  const id = Maps.use((state) => state.id);
  const disturbed = Maps.use((state) => state.disturbed);

  return (
    <Canvas
      flat
      shadows
      dpr={[1, MAX_PIXEL_RATIO]}
      frameloop="never"
      style={{ background: "black" }}
      camera={{
        fov: 45,
        near: 1,
        far: 10000,
        position: initialCamera(DEFAULT_EXTENT),
      }}
    >
      <FrameLimiter />
      <Controls />

      <Suspense fallback={null}>
        <MapModel key={id} id={id} />
      </Suspense>

      {disturbed && <AxisGizmo />}
    </Canvas>
  );
}
