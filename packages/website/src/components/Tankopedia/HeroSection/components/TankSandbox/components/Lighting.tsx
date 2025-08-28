import { Environment } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { DirectionalLight, Euler } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { useModel } from '../../../../../../hooks/useModel';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

const LIGHTS_COUNT = 5;
const SIZE = 2 ** 11;

interface LightingProps {
  display: TankopediaDisplay;
}

export function Lighting({ display }: LightingProps) {
  const protagonist = Duel.use((state) => state.protagonist);
  const { hasPbr } = useModel(protagonist.tank.id);
  const isBrighterLighting =
    !hasPbr && display !== TankopediaDisplay.StaticArmor;

  const light = useRef<DirectionalLight>(null);

  useEffect(() => {
    if (!light.current) return;

    light.current.shadow.mapSize.width = SIZE;
    light.current.shadow.mapSize.height = SIZE;
  }, []);

  return (
    <>
      <directionalLight
        position={[-2, 0.5, -1]}
        intensity={5}
        castShadow
        ref={light}
      />
      <directionalLight position={[2, -0.5, 0]} intensity={1} />
      <directionalLight position={[0, -0.5, -2]} intensity={0.5} />
      <ambientLight intensity={1} />
    </>
  );

  return (
    <>
      {display !== TankopediaDisplay.StaticArmor && (
        <Environment
          files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/winter_river_1k.hdr"
          environmentIntensity={isBrighterLighting ? 1.5 : 1.25}
          environmentRotation={new Euler(0, degToRad(180), 0)}
        />
      )}
      {display === TankopediaDisplay.StaticArmor && (
        <Environment preset="lobby" />
      )}
    </>
  );
}
