import { Environment } from '@react-three/drei';
import { Euler } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { useModel } from '../../../../../../hooks/useModel';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

const LIGHTS_COUNT = 5;

interface LightingProps {
  display: TankopediaDisplay;
}

export function Lighting({ display }: LightingProps) {
  const protagonist = Duel.use((state) => state.protagonist);
  const { hasPbr } = useModel(protagonist.tank.id);
  const isBrighterLighting =
    !hasPbr && display !== TankopediaDisplay.StaticArmor;

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
