import { useFrame, useThree } from "@react-three/fiber";
import { times } from "lodash-es";
import { useEffect, useRef } from "react";
import { SpotLight, type Group } from "three";
import { clamp, degToRad, lerp } from "three/src/math/MathUtils.js";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { TankopediaPersistent } from "../../../../../../stores/tankopediaPersistent";
import { HelpingSpotLight } from "../../../../../HelpingSpotLight";

const ANGLE = Math.PI / 3;
const REVEAL_ANIMATION_TIME = 3;
const TRANSITION_ANIMATION_TIME = 0.5;

const LIGHTS_COUNT = 4;
const THETA_OFFSET = degToRad(-150);
const LIGHT_DISTANCE = 13;
const LIGHT_HEIGHT_0 = 4;
const LIGHT_HEIGHT_1 = 8;
const INTENSITY_0 = 70;
const INTENSITY_1 = 40;

export function Lighting() {
  const wrapper = useRef<Group>(null!);
  const t0 = useRef(0);
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

  useFrame(({ clock, invalidate }) => {
    const x = clamp(
      (clock.elapsedTime - t0.current) / animationTime.current,
      0,
      2
    );
    const t = 0.5 * Math.sin(Math.PI * (x + 0.5)) + 0.5;

    for (const child of wrapper.current.children) {
      if (child instanceof SpotLight) {
        child.angle = ANGLE * t;
      }
    }

    if (x < 2) invalidate();

    if (x === 2 && display !== requestedDisplay) {
      Tankopedia.mutate((draft) => {
        draft.display = requestedDisplay;
      });
    }
  });

  useEffect(() => {
    if (requestedDisplay === display) return;

    t0.current = clock.elapsedTime;
    animationTime.current = TRANSITION_ANIMATION_TIME;
  }, [requestedDisplay]);

  return (
    <group ref={wrapper}>
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
            decay={1}
            color="#ffffff"
          />
        );
      })}
    </group>
  );
}
