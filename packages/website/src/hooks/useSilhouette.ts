import { mauveDark } from "@radix-ui/colors";
import { invalidate, useFrame } from "@react-three/fiber";
import type { QuicklimeEvent } from "quicklime";
import { useEffect, useRef } from "react";
import { Color, MeshStandardMaterial } from "three";
import {
  TRANSITION_ANIMATION_TIME,
  transitionEvent,
} from "../components/Lighting";

const SILHOUETTE_COLOR = new Color(mauveDark.mauve9);
// demand frameloop deltas span the idle time before a frame; cap them
const MAX_DELTA = 1 / 30;

// owns the materials' emissive: emissive parts fade with the lights, and
// while the lights are down the tank is drawn as a flat light shape
export function useSilhouette(
  silhouette: boolean,
  materials: MeshStandardMaterial[],
) {
  // how much of the silhouette is shown; fades in when the tank loads
  const shown = useRef(0);
  const render = useRef<() => void>(undefined);

  useEffect(() => {
    const entries = materials.map((material) => ({
      material,
      emissive: material.emissive.clone(),
      emissiveMap: material.emissiveMap,
      emissiveIntensity: material.emissiveIntensity,
    }));
    const glowing = entries.filter((entry) => entry.emissiveMap);
    // how far the lights are up; the silhouette is what the lights hide
    let light = transitionEvent.last!;
    let active = false;

    function swap(silhouetted: boolean) {
      active = silhouetted;

      for (const entry of entries) {
        entry.material.emissive.copy(
          silhouetted ? SILHOUETTE_COLOR : entry.emissive,
        );

        // only toggling the map changes the shader; color is a uniform
        if (entry.emissiveMap) {
          entry.material.emissiveMap = silhouetted ? null : entry.emissiveMap;
          entry.material.needsUpdate = true;
        }

        if (!silhouetted) {
          entry.material.emissiveIntensity = entry.emissiveIntensity;
        }
      }
    }

    function apply() {
      const intensity = shown.current * (1 - light);

      if (intensity > 0 !== active) swap(intensity > 0);

      if (active) {
        for (const entry of entries) {
          entry.material.emissiveIntensity = intensity;
        }
      } else {
        // the rest keep their original intensity, restored by swap
        for (const entry of glowing) {
          entry.material.emissiveIntensity = light;
        }
      }
    }

    function handleTransitionEvent(event: QuicklimeEvent<number>) {
      light = event.data;
      apply();
    }

    shown.current = 0;
    render.current = apply;
    apply();
    invalidate();
    transitionEvent.on(handleTransitionEvent);

    return () => {
      render.current = undefined;
      transitionEvent.off(handleTransitionEvent);

      if (active) swap(false);

      for (const entry of glowing) {
        entry.material.emissiveIntensity = entry.emissiveIntensity;
      }
    };
  }, [materials]);

  useEffect(() => {
    invalidate();
  }, [silhouette]);

  useFrame((state, delta) => {
    const target = silhouette ? 1 : 0;

    if (shown.current === target) return;

    const step = Math.min(delta, MAX_DELTA) / TRANSITION_ANIMATION_TIME;

    shown.current =
      target > shown.current
        ? Math.min(target, shown.current + step)
        : Math.max(target, shown.current - step);

    render.current?.();

    if (shown.current !== target) state.invalidate();
  });
}
