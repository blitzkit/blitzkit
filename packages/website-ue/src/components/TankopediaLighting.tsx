import { times } from "lodash-es";
import { Quicklime } from "quicklime";
import { degToRad, lerp } from "three/src/math/MathUtils.js";

const ANGLE = Math.PI * 2 ** -2;

const LIGHTS_COUNT = 5;
const THETA_OFFSET = degToRad(-152);
const LIGHT_DISTANCE = 13;
const LIGHT_HEIGHT_0 = 4;
const LIGHT_HEIGHT_1 = 2;
const INTENSITY_0 = 2.5;
const INTENSITY_1 = 1.5;
const HEMISPHERE_INTENSITY = 2;

export const transitionEvent = new Quicklime<number>(0);

export function TankopediaLighting() {
  return (
    <group>
      <hemisphereLight
        intensity={HEMISPHERE_INTENSITY}
        color="#ffffff"
        groundColor="#afafaf"
      />

      {times(LIGHTS_COUNT, (index) => {
        const x = index / (LIGHTS_COUNT - 1);
        const theta = 2 * Math.PI * (index / LIGHTS_COUNT) + THETA_OFFSET;
        const position = [
          LIGHT_DISTANCE * Math.sin(theta),
          lerp(LIGHT_HEIGHT_0, LIGHT_HEIGHT_1, x),
          LIGHT_DISTANCE * Math.cos(theta),
        ] as const;
        const intensity = lerp(INTENSITY_0, INTENSITY_1, x);

        return (
          <spotLight
            castShadow
            userData={{ index }}
            key={index}
            position={position}
            intensity={intensity}
            penumbra={1}
            decay={0}
            color="#ffffff"
            angle={ANGLE}
          />
        );
      })}
    </group>
  );
}
