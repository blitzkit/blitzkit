import { useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { times } from "lodash-es";
import { useRef, useState } from "react";
import { Color, SpotLight, SpotLightHelper } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { isHalloween } from "../../../../../../core/blitzkit/isHalloween";
import { HelpingSpotLight } from "../../../../../HelpingSpotLight";

const LIGHTS_COUNT = 5;
const LIGHT_DISTANCE = 13;
const LIGHT_HEIGHT_0 = 4;
const LIGHT_HEIGHT_1 = 2;
const INTENSITY = 35;

const N = 128;
const TARGET_FRAME_RATE = 30;

export function Lighting() {
  const [cast, setCast] = useState(true);

  const topLight = useRef<SpotLight>(null!);
  const frontLight = useRef<SpotLight>(null!);

  useHelper(topLight, SpotLightHelper, "red");
  useHelper(frontLight, SpotLightHelper, "green");

  const last = useRef<number>(0);
  const samples = useRef<number[]>([]);

  useFrame(({ clock }) => {
    if (!cast) return;

    const dt = clock.elapsedTime - last.current;
    last.current = clock.elapsedTime;

    const fps = 1 / dt;
    samples.current.push(fps);

    if (samples.current.length > N) samples.current.shift();

    const avg =
      samples.current.reduce((a, b) => a + b, 0) / samples.current.length;

    if (avg < TARGET_FRAME_RATE) setCast(false);
  });

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
            castShadow={cast}
            decay={1}
            color={color}
          />
        );
      })}
    </>
  );
}
