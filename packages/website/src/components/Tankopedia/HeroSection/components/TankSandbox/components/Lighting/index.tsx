import { useHelper } from '@react-three/drei';
import { times } from 'lodash-es';
import { useRef } from 'react';
import { Color, SpotLight, SpotLightHelper } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { isHalloween } from '../../../../../../../core/blitzkit/isHalloween';
import { HelpingSpotLight } from '../../../../../../HelpingSpotLight';

const LIGHTS_COUNT = 5;
const LIGHT_DISTANCE = 13;
const LIGHT_HEIGHT_0 = 4;
const LIGHT_HEIGHT_1 = 2;
const INTENSITY = 30;

export function Lighting() {
  const topLight = useRef<SpotLight>(null!);
  const frontLight = useRef<SpotLight>(null!);

  useHelper(topLight, SpotLightHelper, 'red');
  useHelper(frontLight, SpotLightHelper, 'green');

  return (
    <>
      {times(LIGHTS_COUNT, (index) => {
        const x = index / (LIGHTS_COUNT - 1);
        const theta = 2 * Math.PI * (index / LIGHTS_COUNT) - degToRad(152);
        const position = [
          LIGHT_DISTANCE * Math.sin(theta),
          LIGHT_HEIGHT_0 * (1 - x) + LIGHT_HEIGHT_1 * x,
          LIGHT_DISTANCE * Math.cos(theta),
        ] as const;
        const color = new Color();

        if (isHalloween()) color.set(1, 0.25, 0.25);

        return (
          <HelpingSpotLight
            position={position}
            intensity={INTENSITY}
            penumbra={1}
            castShadow
            decay={1}
            color={color}
          />
        );
      })}
    </>
  );
}
