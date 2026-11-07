import { VertexAttribute } from "@blitzkit/core";
import type { MapMaterialExtras, MapSceneExtras } from "../extras";
import { addExtras, createAccessor, type MapContext } from "./context";
import { findComponent, hierarchyComponents } from "./hierarchy";
import { readFloats } from "./materials";
import { primitiveMode, readAttributes } from "./primitive";

function rectArea([minX, minY, maxX, maxY]: number[]) {
  return (maxX - minX) * (maxY - minY);
}

function findPlayableBorder({ sc2 }: MapContext, tags: string | undefined) {
  const borders = sc2["#hierarchy"].flatMap((hierarchy) => {
    const components = hierarchyComponents(hierarchy);
    const border = findComponent(components, "MapBorderComponent");
    const labels: string[] =
      findComponent(components, "LabelComponent")?.["lc.labels"] ?? [];
    const renderObject = components.find(
      (component) =>
        component["rc.renderObj"]?.["##name"] === "MapBorderRenderObject",
    )?.["rc.renderObj"];

    return border
      ? [
          {
            labels,
            rect: readFloats(border["mbc.rect"], 4) ?? [],
            renderObject,
          },
        ]
      : [];
  });

  return (
    borders.find(({ labels }) => tags !== undefined && labels.includes(tags)) ??
    borders.sort((a, b) => rectArea(b.rect) - rectArea(a.rect))[0]
  );
}

export function addBorder(context: MapContext, tags: string | undefined) {
  const { document, scene, scg } = context;
  const border = findPlayableBorder(context, tags);

  if (border?.rect.length === 4) {
    addExtras(scene, { playableBounds: border.rect } satisfies MapSceneExtras);
  }

  const geometry = border?.renderObject
    ? scg.get(border.renderObject["ro.batches"]["0000"]?.["rb.datasource"])
    : undefined;

  if (!geometry) return;

  const attributes = readAttributes(geometry);
  const positions = attributes.get(VertexAttribute.VERTEX);
  const colors = attributes.get(VertexAttribute.COLOR);

  if (!positions || !colors) return;

  const primitive = document
    .createPrimitive()
    .setMode(primitiveMode(geometry))
    .setMaterial(
      document
        .createMaterial("mapBorder")
        .setDoubleSided(true)
        .setExtras({ kind: "border" } satisfies MapMaterialExtras),
    )
    .setIndices(
      createAccessor(context, "SCALAR", new Uint32Array(geometry.indices)),
    )
    .setAttribute(
      "POSITION",
      createAccessor(context, "VEC3", new Float32Array(positions.flat())),
    )
    .setAttribute(
      "COLOR_0",
      createAccessor(context, "VEC4", new Float32Array(colors.flat())),
    );

  scene.addChild(
    document
      .createNode("mapBorder")
      .setMesh(document.createMesh("mapBorder").addPrimitive(primitive)),
  );
}
