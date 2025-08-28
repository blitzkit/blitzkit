import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Model } from './components/Model';

export function MixerScene() {
  return (
    <Canvas
      shadows
      camera={{
        fov: 45,
        position: [5, 5, -5],
      }}
    >
      <OrbitControls />

      <directionalLight position={[10, 10, 10]} intensity={5} castShadow />
      <directionalLight position={[-10, -10, -10]} intensity={3} castShadow />

      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  );
}
