import { useFrame } from '@react-three/fiber';
import { clamp } from 'lodash-es';
import { useRef } from 'react';
import { MeshStandardMaterial } from 'three';

const SIZE = 2 ** 6;

export function SceneProps() {
  const material = useRef<MeshStandardMaterial>(null);

  useFrame(({ camera }) => {
    if (!material.current) return;
    material.current.opacity = clamp(0.5 * camera.position.y, 0, 1);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[SIZE, SIZE]} />
      <meshStandardMaterial
        transparent
        ref={material}
        color="black"
        roughness={1}
        metalness={1}
      />
    </mesh>
  );
}
