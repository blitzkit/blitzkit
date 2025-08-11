import { Canvas } from '@react-three/fiber';
import { CanvasContent } from './CanvasContent';

export const zoom = 60;

export function FlexibilityCanvas() {
  return (
    <Canvas
      frameloop="demand"
      orthographic
      camera={{
        zoom,
        position: [10, 0, -1.5],
        rotation: [0, Math.PI / 2, 0],
      }}
    >
      <CanvasContent />
    </Canvas>
  );
}
