import { useFrame, useLoader } from '@react-three/fiber';
import { clamp } from 'lodash-es';
import { useRef } from 'react';
import { MeshStandardMaterial, TextureLoader } from 'three';
import { TankopediaEphemeral } from '../../../../../../../stores/tankopediaEphemeral';

export function SceneProps() {
  const disturbed = TankopediaEphemeral.use((state) => state.disturbed);
  const material = useRef<MeshStandardMaterial>(null);

  const texture = useLoader(TextureLoader, '/assets/images/3d/grid.png');
  texture.anisotropy = 2;

  useFrame(({ camera }) => {
    if (!material.current) return;
    material.current.opacity = clamp(0.5 * camera.position.y, 0, 1);
  });

  if (!disturbed) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial ref={material} map={texture} transparent />
    </mesh>
  );
}
