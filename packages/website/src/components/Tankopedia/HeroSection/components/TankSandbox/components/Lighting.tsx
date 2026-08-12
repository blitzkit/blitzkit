import { blueDark, orangeDark } from "@radix-ui/colors";
import { ContactShadows } from "@react-three/drei";
import { invalidate, useFrame } from "@react-three/fiber";
import { clamp, times } from "lodash-es";
import { Quicklime } from "quicklime";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { HemisphereLight, SpotLight, type Group } from "three";
import { degToRad, lerp } from "three/src/math/MathUtils.js";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { TankopediaPersistent } from "../../../../../../stores/tankopediaPersistent";
import { TankopediaDisplay } from "../../../../../../stores/tankopediaPersistent/constants";

const ANGLE = degToRad(15);
const REVEAL_ANIMATION_TIME = 3;
const TRANSITION_ANIMATION_TIME = 0.5;

const LIGHTS_COUNT = 3;
const THETA_OFFSET = degToRad(180 - 45);

const LIGHT_DISTANCE = 20;
const LIGHT_HEIGHT_0 = 7;
const LIGHT_HEIGHT_1 = 10;

const INTENSITY_0 = 2 ** 6;
const INTENSITY_1 = 2 ** 3;
const HEMISPHERE_INTENSITY = 2 ** 0.7;
const NON_PBR_FACTOR = 2;

const SHADOW_RESOLUTION = 2 ** 9;
const SHADOW_FOCUS = 2 ** 0;

export const transitionEvent = new Quicklime<number>(0);

interface Props {
  hasPbr: boolean;
}

export function Lighting({ hasPbr }: Props) {
  const wrapper = useRef<Group>(null);

  const highGraphics = TankopediaPersistent.use((state) => state.highGraphics);
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);

  const animationTime = useRef(REVEAL_ANIMATION_TIME);
  const t0 = useRef(performance.now() / 1e3 - animationTime.current);

  const isRevealing = useRef(true);

  const [animate, setAnimate] = useState(true);

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
      <ContactShadows
        near={0}
        far={2 ** 6}
        width={1.5}
        height={1.5}
        blur={2 ** 0.5}
        opacity={2 ** -0.4}
        resolution={2 ** 7}
        depthWrite={false}
      />

      {animate && (
        <Animator
          hasPbr={hasPbr}
          t0={t0}
          animationTime={animationTime}
          wrapper={wrapper}
          stop={() => {
            setAnimate(false);
          }}
        />
      )}

      <group ref={wrapper}>
        <hemisphereLight
          intensity={0}
          color={blueDark.blue12}
          groundColor={orangeDark.orange8}
        />

        {times(LIGHTS_COUNT, (index) => {
          const x = index / (LIGHTS_COUNT - 1);
          const theta = 2 * Math.PI * (index / LIGHTS_COUNT) + THETA_OFFSET;
          const position = [
            -LIGHT_DISTANCE * Math.sin(theta),
            lerp(LIGHT_HEIGHT_0, LIGHT_HEIGHT_1, x),
            LIGHT_DISTANCE * Math.cos(theta),
          ] as const;
          const intensity = lerp(INTENSITY_0, INTENSITY_1, x);

          const light = useRef<SpotLight>(null!);

          // useHelper(light, SpotLightHelper);

          return (
            <spotLight
              ref={light}
              key={index}
              position={position}
              intensity={intensity}
              penumbra={1}
              castShadow={highGraphics}
              decay={1}
              color="#ffffff"
              angle={0}
              target-position={[0, 1.5, 0]}
              shadow-mapSize={[SHADOW_RESOLUTION, SHADOW_RESOLUTION]}
              shadow-focus={SHADOW_FOCUS}
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
  wrapper: RefObject<Group | null>;
  hasPbr: boolean;
}

function Animator({ stop, t0, animationTime, wrapper, hasPbr }: AnimatorProps) {
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);
  const display = Tankopedia.use((state) => state.display);

  const factor =
    !hasPbr && display !== TankopediaDisplay.StaticArmor ? NON_PBR_FACTOR : 1;

  useEffect(() => {
    invalidate();
  }, [requestedDisplay === display]);

  const apply = useCallback((t: number) => {
    if (!wrapper.current) return;

    for (const child of wrapper.current.children) {
      if (child instanceof SpotLight) {
        child.angle = ANGLE * t * factor;
      } else if (child instanceof HemisphereLight) {
        child.intensity = HEMISPHERE_INTENSITY * t * factor;
      }
    }

    transitionEvent.dispatch(t);
  }, []);

  useFrame(({ invalidate }) => {
    const dt = performance.now() / 1e3 - t0.current;
    const x = clamp(dt / animationTime.current, 0, 2);

    if (x === 2) {
      apply(1);
      stop();
      return;
    }

    // https://www.desmos.com/calculator/awsbahxjku
    const t = (0.5 * Math.sin(Math.PI * (x + 0.5)) + 0.5) ** 2;

    apply(t);
    invalidate();

    if (x >= 1 && Tankopedia.state.display !== requestedDisplay) {
      Tankopedia.mutate((draft) => {
        draft.display = requestedDisplay;
      });
    }
  });

  return null;
}
