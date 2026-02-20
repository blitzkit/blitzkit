import { useFrame, useThree } from "@react-three/fiber";
import { times } from "lodash-es";
import { Quicklime } from "quicklime";
import { useEffect, useRef } from "react";
import { HemisphereLight, SpotLight, type Group } from "three";
import { clamp, degToRad, lerp } from "three/src/math/MathUtils.js";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { TankopediaPersistent } from "../../../../../../stores/tankopediaPersistent";
import { HelpingSpotLight } from "../../../../../HelpingSpotLight";

const ANGLE = Math.PI * 2 ** -2;
const REVEAL_ANIMATION_TIME = 3;
const TRANSITION_ANIMATION_TIME = 0.5;

const LIGHTS_COUNT = 5;
const THETA_OFFSET = degToRad(-152);
const LIGHT_DISTANCE = 13;
const LIGHT_HEIGHT_0 = 4;
const LIGHT_HEIGHT_1 = 2;
const INTENSITY_0 = 3.5 * 2;
const INTENSITY_1 = 1.5 * 2;
const HEMISPHERE_INTENSITY = 2;
const DECAY = 0.25;

export const transitionEvent = new Quicklime<number>(0);

export function Lighting() {
  const wrapper = useRef<Group>(null!);
  const t0 = useRef(0);
  const transition = useRef(false);
  const clock = useThree((state) => state.clock);
  const display = Tankopedia.use((state) => state.display);
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);
  const animationTime = useRef(REVEAL_ANIMATION_TIME);
  const highGraphics = TankopediaPersistent.use((state) => state.highGraphics);

  useEffect(() => {
    Tankopedia.mutate((draft) => {
      draft.revealed = true;
    });

    t0.current = clock.elapsedTime - REVEAL_ANIMATION_TIME;
  }, []);

  useFrame(({ invalidate }) => {
    if (transition.current) {
      transition.current = false;
      t0.current = clock.elapsedTime;
    }

    const x = clamp(
      (clock.elapsedTime - t0.current) / animationTime.current,
      0,
      2,
    );
    const t = (0.5 * Math.sin(Math.PI * (x + 0.5)) + 0.5) ** 2;

    if (t !== transitionEvent.last) {
      transitionEvent.dispatch(t);
    }

    for (const child of wrapper.current.children) {
      if (child instanceof SpotLight) {
        child.angle = ANGLE * t;
      } else if (child instanceof HemisphereLight) {
        child.intensity = HEMISPHERE_INTENSITY * t;
      }
    }

    if (x < 2) invalidate();

    if (
      x > 1 &&
      Tankopedia.state.display !== Tankopedia.state.requestedDisplay
    ) {
      Tankopedia.mutate((draft) => {
        draft.display = requestedDisplay;
      });
    }
  });

  useEffect(() => {
    if (requestedDisplay === display) return;

    transition.current = true;
    animationTime.current = TRANSITION_ANIMATION_TIME;
  }, [requestedDisplay]);

  return (
    <group ref={wrapper}>
      <hemisphereLight intensity={0} color="#ffffff" groundColor="#afafaf" />

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
          <HelpingSpotLight
            userData={{ index }}
            key={index}
            position={position}
            intensity={intensity}
            penumbra={1}
            castShadow={highGraphics}
            decay={DECAY}
            color="#ffffff"
            angle={0}
          />
        );
      })}
    </group>
  );
}
