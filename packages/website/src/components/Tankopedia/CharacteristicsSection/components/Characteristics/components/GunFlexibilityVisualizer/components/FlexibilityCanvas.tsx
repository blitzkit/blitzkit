import { Canvas } from '@react-three/fiber';
import { CameraPositioner, zoom } from './CameraPositioner';
import { CanvasContent } from './CanvasContent';

export function FlexibilityCanvas() {
  return (
    <Canvas
      frameloop="demand"
      orthographic
      camera={{
        zoom,
        rotation: [0, Math.PI / 2, 0],
      }}
    >
      <CanvasContent />
      <CameraPositioner />
    </Canvas>
  );
}
