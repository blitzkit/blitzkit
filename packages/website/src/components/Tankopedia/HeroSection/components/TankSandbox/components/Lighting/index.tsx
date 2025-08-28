import { useHelper } from '@react-three/drei';
import { times } from 'lodash-es';
import { useRef } from 'react';
import { SpotLight, SpotLightHelper } from 'three';
import { HelpingPointLight } from '../../../../../../HelpingPointLight';

const LIGHTS_COUNT = 5;
const LIGHT_DISTANCE = 8;
const LIGHT_HEIGHT_0 = 4;
const LIGHT_HEIGHT_1 = 2;
const INTENSITY = 500;

export function Lighting() {
  const topLight = useRef<SpotLight>(null!);
  const frontLight = useRef<SpotLight>(null!);

  useHelper(topLight, SpotLightHelper, 'red');
  useHelper(frontLight, SpotLightHelper, 'green');

  return (
    <>
      {times(LIGHTS_COUNT, (index) => {
        const x = index / (LIGHTS_COUNT - 1);
        const theta = 2 * Math.PI * (index / LIGHTS_COUNT) - (7 / 8) * Math.PI;
        const position = [
          LIGHT_DISTANCE * Math.sin(theta),
          LIGHT_HEIGHT_0 * (1 - x) + LIGHT_HEIGHT_1 * x,
          LIGHT_DISTANCE * Math.cos(theta),
        ] as const;

        return (
          <HelpingPointLight
            position={position}
            intensity={INTENSITY / LIGHTS_COUNT}
            castShadow
          />
        );
      })}
    </>
  );
}
