import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Model } from './components/Model';

export function MixerScene() {
  return (
    <Canvas
      camera={{
        fov: 65,
        position: [5, 5, -5],
      }}
    >
      <OrbitControls />

      <Environment preset="lobby" />
      {/* <ambientLight intensity={6} />
      <pointLight position={[10, 10, 10]} /> */}

      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  );
}
