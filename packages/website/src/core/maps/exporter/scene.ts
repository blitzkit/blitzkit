import type { Hierarchy } from "@blitzkit/core";
import type { Node, Scene } from "@gltf-transform/core";
import { times } from "lodash-es";
import type { MapVisibility, MapWind } from "../extras";
import type { Animator } from "./animation";
import { addExtras, type MapContext } from "./context";
import {
  findComponent,
  hierarchyComponents,
  type MapComponent,
} from "./hierarchy";
import type { MaterialResolver } from "./materials";
import { createBatchPrimitive } from "./primitive";
import type { MapScript, StateSwitch } from "./script";

const RENDER_OBJECT_VISIBLE_FLAG = 1 << 0;
const SHADOW_CASTER_FLAG = 1 << 13;
const OMIT_NODES = /^(MapBorder|smoke|entity_grass)/i;
const COLLISION_ONLY_NODES =
  /^(blocking_volume|invisiblewall|bld_00_colisionfix)/i;
const BLOCKING_COLLISION_TYPES = new Set([3, 4, 6, 7]);

export interface Terrain {
  node: Node;
  renderObject: Record<string, any>;
}

interface States {
  switcher: MapComponent;
  switches: StateSwitch[];
}

export function buildScene(
  context: MapContext,
  materials: MaterialResolver,
  animator: Animator,
  { animationStarts, stateSwitches }: MapScript,
) {
  const { document, scg } = context;
  const terrains: Terrain[] = [];

  function addRenderObject(
    hierarchy: Hierarchy,
    node: Node,
    renderObject: Record<string, any>,
    lodNode: (lodIndex: number) => Node,
    hasLods: boolean,
    collisionType: number | undefined,
    stateControlled: boolean,
    skin: ReturnType<Animator["createSkeleton"]> | undefined,
  ) {
    const collisionOnly = COLLISION_ONLY_NODES.test(hierarchy.name);

    if (renderObject["ro.flags"] & SHADOW_CASTER_FLAG) {
      addExtras(node, { castShadow: true });
    }

    times(renderObject["ro.batchCount"] ?? 0, (batchIndex): void => {
      const lodIndex = renderObject[`rb${batchIndex}.lodIndex`];

      if (lodIndex > 0 && !hasLods) return;
      if (renderObject["##name"] === "WaterRenderObject" && batchIndex > 0) {
        return;
      }

      const batchKey = batchIndex.toString().padStart(4, "0");
      const batch = renderObject["ro.batches"][batchKey];
      const polygonGroup = scg.get(batch["rb.datasource"]);

      if (
        !collisionOnly &&
        !stateControlled &&
        !(renderObject["ro.flags"] & RENDER_OBJECT_VISIBLE_FLAG)
      ) {
        return;
      }

      const blocking =
        lodIndex <= 0 &&
        (collisionOnly ||
          (collisionType !== undefined &&
            BLOCKING_COLLISION_TYPES.has(collisionType)));
      const resolved = collisionOnly
        ? blocking
          ? materials.resolveCollision()
          : undefined
        : materials.resolve(batch["rb.nmatname"]) ??
          (blocking ? materials.resolveCollision() : undefined);

      if (!resolved || !polygonGroup) return;

      const built = createBatchPrimitive(
        context,
        polygonGroup,
        resolved,
        renderObject,
        batchIndex,
        skin,
      );

      if (!built) return;

      const meshNode = document
        .createNode(batchKey)
        .setMesh(document.createMesh().addPrimitive(built.primitive));

      if (built.skinned) meshNode.setSkin(skin!);

      lodNode(lodIndex).addChild(meshNode);
    });

    if (renderObject.hmap) terrains.push({ node, renderObject });
  }

  function addHierarchies(
    hierarchies: Hierarchy[],
    parent: Scene | Node,
    inheritedCollision?: number,
    stateControlled = false,
    states?: States,
  ) {
    hierarchies.forEach((hierarchy) => {
      const state = hierarchy.name.match(/ State (\d+)$/);

      if (state && state[1] !== "0") return;
      if (OMIT_NODES.test(hierarchy.name)) return;

      const node = document.createNode(hierarchy.name);
      const stateIndex = states
        ? times(states.switcher["ssc.statesCount"]).find(
            (index) => states.switcher[`ssc.state${index}`] === hierarchy.name,
          )
        : undefined;

      if (states && stateIndex !== undefined) {
        addExtras(node, {
          visibility: {
            initial: stateIndex === states.switcher["ssc.activeState"],
            changes: states.switches.map(([time, active]) => [
              time,
              stateIndex === active,
            ]),
          } satisfies MapVisibility,
        });
      }

      const components = hierarchyComponents(hierarchy);
      const lodComponent = findComponent(components, "LodComponent");
      const lodNodes = new Map<number, Node>();
      const collisionComponent = findComponent(
        components,
        "CollisionTypeComponent",
      );
      const collisionType: number | undefined =
        collisionComponent?.CollisionType ?? inheritedCollision;

      if (collisionComponent) addExtras(node, { collision: collisionType });

      function lodNode(lodIndex: number) {
        if (lodIndex < 0 || !lodComponent) return node;
        if (!lodNodes.has(lodIndex)) {
          const child = document
            .createNode(`LOD${lodIndex}`)
            .setExtras({ lod: lodIndex });

          lodNodes.set(lodIndex, child);
          node.addChild(child);
        }

        return lodNodes.get(lodIndex)!;
      }

      const skeletonComponent = findComponent(components, "SkeletonComponent");
      const motionComponent = findComponent(components, "MotionComponent");
      const skin =
        skeletonComponent && motionComponent
          ? animator.createSkeleton(
              node,
              hierarchy,
              skeletonComponent,
              motionComponent,
              animationStarts.get(hierarchy),
            )
          : undefined;
      const speedTreeComponent = findComponent(
        components,
        "SpeedTreeComponent",
      );

      if (speedTreeComponent) {
        addExtras(node, {
          wind: {
            leafAmplitude: speedTreeComponent["stc.leafsOscillationAmplitude"],
            leafSpeed: speedTreeComponent["stc.leafsOscillationSpeed"],
            trunkAmplitude: speedTreeComponent["stc.trunkOscillationAmplitude"],
            trunkSpring: speedTreeComponent["stc.trunkOscillationSpring"],
            trunkDamping: speedTreeComponent["stc.trunkOscillationDamping"],
          } satisfies MapWind,
        });
      }

      if (lodComponent) {
        const distances = lodComponent["lc.loddist"];

        addExtras(node, {
          lodDistances: times(4, (index) =>
            Math.min(distances[`distance${index}`], Number.MAX_VALUE),
          ),
        });
      }

      components.forEach((component) => {
        switch (component["comp.typename"]) {
          case "TransformComponent": {
            node.setTranslation(component["tc.localTranslation"]);
            node.setRotation(component["tc.localRotation"]);
            node.setScale(component["tc.localScale"]);
            break;
          }

          case "RenderComponent": {
            addRenderObject(
              hierarchy,
              node,
              component["rc.renderObj"],
              lodNode,
              !!lodComponent,
              collisionType,
              stateControlled,
              skin,
            );
            break;
          }

          case "AnimationComponent": {
            const start = animationStarts.get(hierarchy);

            if (start) animator.addKeyframes(node, component, start);

            break;
          }
        }
      });

      const switcher = findComponent(components, "StateSwitcherComponent");
      const switches = stateSwitches.get(hierarchy);

      if (hierarchy["#hierarchy"]) {
        addHierarchies(
          hierarchy["#hierarchy"],
          node,
          collisionType,
          stateControlled || !!(switcher && switches),
          switcher && switches ? { switcher, switches } : undefined,
        );
      }

      parent.addChild(node);
    });
  }

  addHierarchies(context.sc2["#hierarchy"], context.scene);

  return terrains;
}
