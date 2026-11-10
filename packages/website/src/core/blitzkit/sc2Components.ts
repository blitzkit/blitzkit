import {
  parseHierarchies,
  VertexAttribute,
  vertexAttributeVectorSizes,
  type Component,
  type ComponentName,
  type ComponentOf,
  type Hierarchy,
  type PolygonGroup,
  type SC2,
  type ScgPolygonGroups,
} from "@blitzkit/core";
import type { AbstractVFS } from "@blitzkit/core/src/blitzkit/vfs/abstract";
import {
  Accessor,
  Document,
  Material,
  Node,
  type Buffer,
  type Skin,
} from "@gltf-transform/core";
import { sortBy, times } from "lodash-es";
import {
  sc2ToGltfQuaternion,
  sc2ToGltfScale,
  sc2ToGltfVector,
  sc2ToGltfVectors,
} from "./sc2Axes";
import type { Motion } from "./skinAnimations/motion";
import {
  bindSocket,
  createMotionClip,
  createSkeleton,
  loadMotion,
  skinPrimitive,
  type Skeleton,
} from "./skinAnimations/skeleton";
import type { Garage } from "./switcherStates";

/**
 * Shared SC2 -> glTF component handling. Every exporter (visual model, armor
 * collision, ...) goes through {@link Sc2ComponentHandler} so that coordinate
 * conversion and component semantics can never drift between them.
 */

export const vertexAttributeGLTFName: Partial<Record<VertexAttribute, string>> =
  {
    [VertexAttribute.VERTEX]: "POSITION",
    [VertexAttribute.NORMAL]: "NORMAL",
    [VertexAttribute.TEXCOORD0]: "TEXCOORD_0",
    [VertexAttribute.TEXCOORD1]: "TEXCOORD_1",
    [VertexAttribute.TEXCOORD2]: "TEXCOORD_2",
    [VertexAttribute.TEXCOORD3]: "TEXCOORD_3",
  };

export const vertexAttributeGltfVectorSizes = {
  ...vertexAttributeVectorSizes,
  [VertexAttribute.TANGENT]: 4,
} as const;

type RenderComponent = ComponentOf<"RenderComponent">;

const SPATIAL_ATTRIBUTES = new Set<VertexAttribute>([
  VertexAttribute.VERTEX,
  VertexAttribute.NORMAL,
  VertexAttribute.TANGENT,
  VertexAttribute.BINORMAL,
]);

/** Groups a polygon group's interleaved vertices by attribute. */
export function collectVertexAttributes(polygonGroup: PolygonGroup) {
  const attributes = new Map<VertexAttribute, number[][]>();

  polygonGroup.vertices.forEach((vertex) => {
    vertex.forEach(({ attribute, value }) => {
      if (!attributes.has(attribute)) attributes.set(attribute, []);

      attributes.get(attribute)!.push(value);
    });
  });

  return attributes;
}

/** Converts attributes to glTF accessors, correcting the SC2 -> glTF axes. */
export function createAttributeAccessors(
  document: Document,
  buffer: Buffer,
  attributes: Map<VertexAttribute, number[][]>,
) {
  const accessors = new Map<string, Accessor>();

  attributes.forEach((value, attribute) => {
    const name = vertexAttributeGLTFName[attribute];

    if (name === undefined || accessors.has(name)) return;

    const vertexSize = vertexAttributeGltfVectorSizes[attribute];
    const array = new Float32Array(value.flat());

    if (SPATIAL_ATTRIBUTES.has(attribute)) sc2ToGltfVectors(array);

    accessors.set(
      name,
      document
        .createAccessor(name)
        .setType(vertexSize === 1 ? "SCALAR" : `VEC${vertexSize}`)
        .setArray(array)
        .setBuffer(buffer),
    );
  });

  return accessors;
}

/**
 * Motion files are needed before the hierarchy is walked because they are
 * loaded asynchronously.
 */
export async function loadHierarchyMotions(
  vfs: AbstractVFS,
  path: string,
  sc2: SC2,
) {
  const motions = new Map<Hierarchy, Motion>();
  const loading: Promise<void>[] = [];

  parseHierarchies(sc2["#hierarchy"], null, (hierarchy, components) => {
    for (const component of components) {
      if (component["comp.typename"] !== "MotionComponent") continue;

      loading.push(
        loadMotion(vfs, path, component).then((motion) => {
          motions.set(hierarchy, motion);
        }),
      );
    }

    return null;
  });

  await Promise.all(loading);

  return motions;
}

export type Sc2RenderMode =
  | {
      kind: "visual";
      /** material key -> material (or an unresolved/shadow entry) */
      materials: Map<bigint, Material | bigint | undefined>;
      /** parts keep lod-less (-1) batches */
      isPart: boolean;
    }
  | {
      /** armor: untextured, one node per hard joint */
      kind: "collision";
    };

export interface Sc2ComponentHandlerOptions {
  document: Document;
  buffer: Buffer;
  scg: ScgPolygonGroups;
  render: Sc2RenderMode;
  /** enables skeletons, motion clips and joint bindings */
  skeleton?: {
    motions: Map<Hierarchy, Motion>;
    garage?: Garage;
  };
  /** throw on component types this handler does not know about */
  strict?: boolean;
}

interface HierarchyContext {
  hierarchy: Hierarchy;
  components: Component[];
  node: Node;
}

/** Order in which components must be applied; the rest keep file order. */
const COMPONENT_PRIORITY: Partial<Record<ComponentName, number>> = {
  TransformComponent: 0,
  StateSwitcherComponent: 0,
  SkeletonComponent: 1,
  SkeletonJointBindingComponent: 2,
  RenderComponent: 3,
};

function componentPriority(component: Component) {
  return COMPONENT_PRIORITY[component["comp.typename"]] ?? 10;
}

type ComponentHandler<Name extends ComponentName> = (
  component: ComponentOf<Name>,
  context: HierarchyContext,
) => void;

type AnyComponentHandler = (
  component: Component,
  context: HierarchyContext,
) => void;

/**
 * A `null` handler marks a component type that carries nothing the exporters
 * need. They are listed explicitly so the handler table is checked
 * exhaustively against the Component union.
 */
type ComponentHandlers = {
  [Name in ComponentName]: ComponentHandler<Name> | null;
};

export class Sc2ComponentHandler {
  private readonly skeletons = new Map<Hierarchy, Skeleton>();
  private readonly jointBindings: [
    owner: Node,
    entity: string,
    joint: Node,
    skin: Skin,
  ][] = [];

  private readonly handlers: ComponentHandlers = {
    TransformComponent: (component, { node }) => {
      node.setTranslation(sc2ToGltfVector(component["tc.localTranslation"]));
      node.setRotation(sc2ToGltfQuaternion(component["tc.localRotation"]));
      node.setScale(sc2ToGltfScale(component["tc.localScale"]));
    },
    StateSwitcherComponent: (component, { hierarchy, node }) => {
      const garage = this.options.skeleton?.garage;

      node.setExtras({
        // a part's scenarios can pick its state as it loads
        state: garage
          ? (garage.states.get(hierarchy) ?? null)
          : component[`ssc.state${component["ssc.activeState"]}`],
      });
    },
    SkeletonComponent: (component, { hierarchy, components, node }) => {
      const { skeleton: options, document, buffer } = this.options;

      if (!options) return;

      const motion = options.motions.get(hierarchy);
      const motionComponent = components.find(
        (other): other is ComponentOf<"MotionComponent"> =>
          other["comp.typename"] === "MotionComponent",
      );
      const created = createSkeleton(document, buffer, node, component, motion);

      this.skeletons.set(hierarchy, created);

      // only what loops in the garage is exported
      if (motion && motionComponent && options.garage?.motions.has(hierarchy)) {
        createMotionClip(
          document,
          buffer,
          `motion${document.getRoot().listAnimations().length}`,
          created.joints,
          motion,
          motionComponent,
        );
      }
    },
    SkeletonJointBindingComponent: (component, { hierarchy, node }) => {
      const skeleton = this.skeletons.get(hierarchy);

      if (!skeleton) return;

      times(component.count, (index) => {
        const binding = component.map[
          index.toString().padStart(4, "0")
        ] as unknown as { entityUid: string; jointUid: string };
        const joint = skeleton.joints.get(binding.jointUid);

        if (!joint) throw new Error(`Missing joint ${binding.jointUid}`);

        this.jointBindings.push([
          node,
          binding.entityUid,
          joint,
          skeleton.skin,
        ]);
      });
    },
    RenderComponent: (component, context) => {
      if (this.options.render.kind === "visual") {
        this.renderVisual(component, context, this.options.render);
      } else {
        this.renderCollision(component, context);
      }
    },

    // lod distances are implied by each batch's lodIndex
    LodComponent: null,
    MotionComponent: null, // consumed by SkeletonComponent
    AnimationComponent: null,
    SlotComponent: null,
    NewSlotComponent: null,
    DecorItemComponent: null,
    ScenarioComponent: null,
    CustomPropertiesComponent: null,
    ActionComponent: null,
    ParticleEffectComponent: null,
    TankElementComponent: null,
  };

  constructor(private readonly options: Sc2ComponentHandlerOptions) {}

  /** Applies every component of one hierarchy entry onto its node. */
  handle(hierarchy: Hierarchy, components: Component[], node: Node) {
    const context: HierarchyContext = { hierarchy, components, node };

    for (const component of sortBy(components, componentPriority)) {
      this.dispatch(component, context);
    }
  }

  private dispatch(component: Component, context: HierarchyContext) {
    const name = component["comp.typename"];
    // the table is exhaustive per name, but indexing by a union loses that
    const handler = this.handlers[name] as
      AnyComponentHandler | null | undefined;

    if (handler === undefined) {
      if (this.options.strict) {
        throw new TypeError(`Unhandled component type: ${name}`);
      }

      return;
    }

    handler?.(component, context);
  }

  /** Call once after the whole hierarchy has been handled. */
  resolveJointBindings() {
    for (const [owner, entity, joint, skin] of this.jointBindings) {
      // the game only binds the skeleton entity's own children
      const socket = owner
        .listChildren()
        .find(
          (child) =>
            child.getName() === entity && !skin.listJoints().includes(child),
        );

      if (!socket) throw new Error(`Missing socket ${entity}`);

      bindSocket(socket, joint, skin);
    }
  }

  private renderVisual(
    component: RenderComponent,
    { hierarchy, node }: HierarchyContext,
    render: Extract<Sc2RenderMode, { kind: "visual" }>,
  ) {
    const { document, buffer, scg } = this.options;
    const renderObject = component["rc.renderObj"];

    times(renderObject["ro.batchCount"], (batchIndex) => {
      const lodIndex = renderObject[`rb${batchIndex}.lodIndex`];

      // -1 means the batch has no lods and is always drawn
      if (lodIndex !== 0 && !(render.isPart && lodIndex === -1)) return;

      const batchKey = batchIndex.toString().padStart(4, "0");
      const batch = renderObject["ro.batches"][batchKey];
      const material = render.materials.get(batch["rb.nmatname"]);
      const polygonGroup = scg.get(batch["rb.datasource"]);

      // probably shadow material
      if (!(material instanceof Material)) return;

      if (polygonGroup === undefined) {
        throw new Error(`Missing polygon group ${batch["rb.datasource"]}`);
      }

      const attributes = collectVertexAttributes(polygonGroup);
      const primitive = document
        .createPrimitive()
        .setIndices(
          document
            .createAccessor()
            .setType("SCALAR")
            .setArray(new Uint16Array(polygonGroup.indices))
            .setBuffer(buffer),
        )
        .setMaterial(material)
        .setName(batchKey);

      createAttributeAccessors(document, buffer, attributes).forEach(
        (accessor, name) => primitive.setAttribute(name, accessor),
      );

      const lodNode = document
        .createNode(batchKey)
        .setMesh(document.createMesh(batch["##name"]).addPrimitive(primitive));
      const skeleton = this.skeletons.get(hierarchy);

      if (
        skeleton &&
        skinPrimitive(
          document,
          buffer,
          primitive,
          attributes,
          renderObject[`skinnedObject.batch${batchIndex}.targetsData`],
        )
      ) {
        lodNode.setSkin(skeleton.skin);
      }

      node.addChild(lodNode);
    });
  }

  private renderCollision(
    component: RenderComponent,
    { hierarchy, node }: HierarchyContext,
  ) {
    const { document, buffer, scg } = this.options;
    const batch = component["rc.renderObj"]["ro.batches"]["0000"];
    const polygonGroup = scg.get(batch["rb.datasource"]);

    if (!polygonGroup) {
      console.warn(
        `Missing polygon group ${batch["rb.datasource"]} (${hierarchy.name}); skipping...`,
      );

      return;
    }

    const hardJointIndices = new Set<number>();
    const vertexHardJointIndices = new Map<number, number>();

    polygonGroup.vertices.forEach((vertex, index) => {
      vertex.forEach(({ attribute, value }) => {
        if (attribute !== VertexAttribute.HARD_JOINTINDEX) return;

        hardJointIndices.add(value[0]);
        vertexHardJointIndices.set(index, value[0]);
      });
    });

    // geometry is shared; only the index list differs per hard joint
    const accessors = createAttributeAccessors(
      document,
      buffer,
      collectVertexAttributes(polygonGroup),
    );

    hardJointIndices.forEach((hardJointIndex) => {
      const primitive = document.createPrimitive().setIndices(
        document
          .createAccessor()
          .setType("SCALAR")
          .setArray(
            new Uint16Array(
              polygonGroup.indices.filter(
                (index) => vertexHardJointIndices.get(index) === hardJointIndex,
              ),
            ),
          )
          .setBuffer(buffer),
      );

      accessors.forEach((accessor, name) =>
        primitive.setAttribute(name, accessor),
      );

      node.addChild(
        document
          .createNode(`${hierarchy.name}_armor_${hardJointIndex}`)
          .setMesh(
            document.createMesh(batch["##name"]).addPrimitive(primitive),
          ),
      );
    });
  }
}
