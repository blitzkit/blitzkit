import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { HemisphereLight, SpotLight, type Group } from "three";
import { clamp } from "three/src/math/MathUtils.js";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { HelpingSpotLight } from "../../../../../HelpingSpotLight";

const ANGLE = Math.PI / 3;
const HEMISPHERE_INTENSITY = 4;
const REVEAL_ANIMATION_TIME = 5;
const TRANSITION_ANIMATION_TIME = 0.5;

export function Lighting() {
  const wrapper = useRef<Group>(null!);
  const t0 = useRef(0);
  const clock = useThree((state) => state.clock);
  const display = Tankopedia.use((state) => state.display);
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);
  const animationTime = useRef(REVEAL_ANIMATION_TIME);

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
      if (child instanceof HemisphereLight) {
        child.intensity = HEMISPHERE_INTENSITY * t;
      } else if (child instanceof SpotLight) {
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
      <hemisphereLight
        position={[0, 1, 0]}
        color="#dadaff"
        groundColor="#856331"
        intensity={0}
      />

      <HelpingSpotLight
        debug
        position={[-6, 6, -10]}
        intensity={4}
        penumbra={1}
        castShadow
        color="#ffffff"
        decay={0}
        angle={0}
      />

      <HelpingSpotLight
        debug
        position={[6, 6, -10]}
        intensity={1}
        penumbra={1}
        castShadow
        color="#ffffff"
        decay={0}
        angle={0}
      />
    </group>
  );
}
