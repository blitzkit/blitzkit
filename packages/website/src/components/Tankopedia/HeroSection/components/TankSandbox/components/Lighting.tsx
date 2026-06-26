import { useFrame } from "@react-three/fiber";
import { clamp, times } from "lodash-es";
import { Quicklime } from "quicklime";
import { useEffect, useRef, useState, type RefObject } from "react";
import { HemisphereLight, SpotLight, type Group } from "three";
import { degToRad, lerp } from "three/src/math/MathUtils.js";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { TankopediaPersistent } from "../../../../../../stores/tankopediaPersistent";
import { HelpingSpotLight } from "../../../../../HelpingSpotLight";

const ANGLE = degToRad(10);
const REVEAL_ANIMATION_TIME = 3;
const TRANSITION_ANIMATION_TIME = 0.5;

const LIGHTS_COUNT = 4;
const THETA_OFFSET = degToRad(180 - 45);
const LIGHT_DISTANCE = 20;
const LIGHT_HEIGHT_0 = 4;
const LIGHT_HEIGHT_1 = 6;
const INTENSITY_0 = 6;
const INTENSITY_1 = 3;
const HEMISPHERE_INTENSITY = 2;

export const transitionEvent = new Quicklime<number>(0);

export function Lighting() {
  const wrapper = useRef<Group>(null!);

  const highGraphics = TankopediaPersistent.use((state) => state.highGraphics);
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);

  const animationTime = useRef(REVEAL_ANIMATION_TIME);
  const t0 = useRef(performance.now() / 1e3 - animationTime.current);

  const isRevealing = useRef(true);

  const [animate, setAnimate] = useState(true);

  console.log(animate);

  useEffect(() => {
    Tankopedia.mutate((draft) => {
      draft.revealed = true;
    });
  }, []);

  useEffect(() => {
    if (isRevealing.current) {
      isRevealing.current = false;
    } else {
      animationTime.current = TRANSITION_ANIMATION_TIME;
      t0.current = performance.now() / 1e3;
    }

    setAnimate(true);
  }, [requestedDisplay]);

  return (
    <>
      {animate && (
        <Animator
          t0={t0}
          animationTime={animationTime}
          wrapper={wrapper}
          stop={() => {
            setAnimate(false);
          }}
        />
      )}

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
              decay={0}
              color="#ffffff"
              angle={0}
            />
          );
        })}
      </group>
    </>
  );
}

interface AnimatorProps {
  stop: () => void;

  t0: RefObject<number>;
  animationTime: RefObject<number>;
  wrapper: RefObject<Group>;
}

function Animator({ stop, t0, animationTime, wrapper }: AnimatorProps) {
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);

  useFrame(({ invalidate }) => {
    const dt = performance.now() / 1e3 - t0.current;
    const x = clamp(dt / animationTime.current, 0, 2);

    if (x === 2) {
      stop();
      return;
    }

    const t = (0.5 * Math.sin(Math.PI * (x + 0.5)) + 0.5) ** 2;

    for (const child of wrapper.current.children) {
      if (child instanceof SpotLight) {
        child.angle = ANGLE * t;
      } else if (child instanceof HemisphereLight) {
        child.intensity = HEMISPHERE_INTENSITY * t;
      }
    }

    transitionEvent.dispatch(t);
    invalidate();

    if (x >= 1 && Tankopedia.state.display !== requestedDisplay) {
      Tankopedia.mutate((draft) => {
        draft.display = requestedDisplay;
      });
    }
  });

  return null;
}
