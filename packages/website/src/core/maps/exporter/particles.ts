import type { Hierarchy } from "@blitzkit/core";
import { times } from "lodash-es";
import { addParticleEffect } from "../../blitzkit/particles/gltf";
import {
  particleEmitters,
  readParticleEffect,
  type ParticleEffect,
} from "../../blitzkit/particles/read";
import { vfs } from "../../blitzkit/vfs";
import type { MapContext } from "./context";
import { findComponent, hierarchyComponents } from "./hierarchy";

export async function createParticles(
  { document, sc2 }: MapContext,
  particleStarts: Map<Hierarchy, number>,
) {
  const particlesNode = document.createNode("particles");
  const emitters = particleEmitters(sc2);

  for (const [hierarchy, delay] of particleStarts) {
    const components = hierarchyComponents(hierarchy);
    const effect = findComponent(components, "ParticleEffectComponent");
    const transform = findComponent(components, "TransformComponent");
    const lodComponent = findComponent(components, "LodComponent");

    if (!effect || !transform) continue;

    const read = readParticleEffect(effect as ParticleEffect, emitters, false);

    if (read.length === 0) continue;

    const node = document
      .createNode(hierarchy.name)
      .setTranslation(transform["tc.worldTranslation"])
      .setRotation(transform["tc.worldRotation"])
      .setScale(transform["tc.worldScale"]);

    await addParticleEffect(document, vfs, node, {
      delay,
      lodDistances: lodComponent
        ? times(4, (index) =>
            Math.min(
              lodComponent["lc.loddist"][`distance${index}`],
              Number.MAX_VALUE,
            ),
          )
        : undefined,
      emitters: read,
    });
    particlesNode.addChild(node);
  }

  if (particlesNode.listChildren().length === 0) return;

  return particlesNode;
}
