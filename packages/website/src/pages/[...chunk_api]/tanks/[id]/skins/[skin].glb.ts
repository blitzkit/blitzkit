import {
  Sc2ReadStream,
  type CamouflagesXml,
  type CamouflagesYaml,
  type Hierarchy,
  type TankParameters,
} from "@blitzkit/core";
import {
  Document,
  Node,
  NodeIO,
  PropertyType,
  Scene,
} from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, mergeDocuments, unpartition } from "@gltf-transform/functions";
import type { APIContext } from "astro";
import type { Vector3Tuple, Vector4Tuple } from "three";
import { api } from "../../../../../core/blitzkit/api";
import { mixStaticPaths } from "../../../../../core/blitzkit/mixStaticPaths";
import { vfs } from "../../../../../core/blitzkit/vfs";
import { SKIN_NUMBER } from "../../../../../constants/skinNumber";
import { getStaticPaths as _getStaticPaths } from "../../../_index";
import { extractMaterials, extractModel } from "../model.glb";

const SKIN_NUMBER_SLOTS = 5;
const DIGIT_COLUMNS = 5;
const DIGIT_ROWS = 2;

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const camouflages = await api.camouflageDefinitions();

  return Object.values(camouflages.camouflages)
    .filter((camouflage) => camouflage.tank_id)
    .map((camouflage) => ({
      params: { id: camouflage.tank_id!, skin: camouflage.id },
      props: { skin: camouflage.id },
    }));
});

export async function GET({ props }: APIContext<{ skin: number }>) {
  const nodeIO = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const camouflagesXml = await vfs.xml<{ root: CamouflagesXml }>(
    "Data/XML/item_defs/vehicles/common/camouflages.xml",
  );
  const camouflagesYaml = await vfs.yaml<CamouflagesYaml>(
    "Data/camouflages.yaml",
  );
  const customization = await vfs.yaml<
    Record<string, { Name: string; Path: string }>
  >("Data/3d/Customization.yaml");
  const items = new Map(
    Object.values(customization).map(({ Name, Path }) => [
      Name,
      Path.replace("~res:/3d/", "").replace(/\.sc2$/, ""),
    ]),
  );
  const key = Object.keys(camouflagesXml.root.camouflages).find(
    (key) => camouflagesXml.root.camouflages[key].id === props.skin,
  )!;
  const include = camouflagesXml.root.camouflages[key].vehicleFilter.include;
  const [nation, tankKey] = (
    include as { vehicle: { name: string } }
  ).vehicle.name.split(":");
  const { preset, customEntities } = camouflagesYaml[key];
  const skinNumber = Number(preset?.match(/(\d+)$/)?.[1] ?? 1);
  const parameters = await vfs.yaml<TankParameters>(
    `Data/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`,
  );
  const basePath = parameters.resourcesPath.blitzModelPath.replace(
    /\.sc2$/,
    "",
  );
  const sc2 = new Sc2ReadStream(
    (await vfs.file(`Data/3d/${basePath}.sc2`)).buffer as ArrayBuffer,
  ).sc2();
  const slots: Record<
    string,
    {
      target: string;
      position: Vector3Tuple;
      rotation: Vector4Tuple;
      scale: Vector3Tuple;
    }
  > = {};
  const states: Record<string, string | null> = {};

  function parseHierarchies(hierarchies: Hierarchy[]) {
    for (const hierarchy of hierarchies) {
      for (let index = 0; index < hierarchy.components.count; index++) {
        const component =
          hierarchy.components[index.toString().padStart(4, "0")];

        if (component["comp.typename"] === "NewSlotComponent") {
          for (const slot of Object.values(component.slots)) {
            slots[slot.name] = {
              target: hierarchy.name,
              position: slot.transform.position,
              rotation: slot.transform.rotation,
              scale: slot.transform.scale,
            };
          }
        }

        if (component["comp.typename"] === "SlotComponent") {
          slots[component["sc.slotName"]] = {
            target: hierarchy.name,
            position: component["sc.attachmentTranslation"] as Vector3Tuple,
            rotation: component["sc.attachmentRotation"] as Vector4Tuple,
            scale: component["sc.attachmentScale"] as Vector3Tuple,
          };
        }

        if (component["comp.typename"] !== "StateSwitcherComponent") continue;

        let state: string | null = null;

        for (let index = 0; index < component["ssc.statesCount"]; index++) {
          const name = component[`ssc.state${index}`];
          const match = name.match(/skin(\d*)/);

          if (
            match &&
            !name.includes("hide") &&
            Number(match[1] || 1) === skinNumber
          ) {
            state = name;
          }
        }

        states[hierarchy.name] = state;
      }

      if (hierarchy["#hierarchy"]) parseHierarchies(hierarchy["#hierarchy"]);
    }
  }

  parseHierarchies(sc2["#hierarchy"]);

  const document = new Document();
  const scene = document.createScene().setExtras({ states });
  const targets = new Map<string, Node>();

  document.createBuffer();

  if (preset) await extractMaterials(document, sc2, basePath, preset);

  for (const name in customEntities) {
    const slot = slots[name];
    const path = items.get(customEntities[name].item);

    if (
      !slot ||
      !path ||
      !(await vfs.resolve(`Data/3d/${path}.sc2`)) ||
      !(await vfs.resolve(`Data/3d/${path}.scg`))
    ) {
      continue;
    }

    const part = await extractModel(vfs, path);
    const map = mergeDocuments(document, part);
    const partScene = map.get(part.getRoot().listScenes()[0]) as Scene;
    const node = document
      .createNode(name)
      .setTranslation(slot.position)
      .setRotation(slot.rotation)
      .setScale(slot.scale);
    let target = targets.get(slot.target);

    if (!target) {
      target = document.createNode(slot.target);
      targets.set(slot.target, target);
      scene.addChild(target);
    }

    for (const child of partScene.listChildren()) {
      node.addChild(child as Node);
    }

    partScene.dispose();
    target.addChild(node);
  }

  applySkinNumber(document, SKIN_NUMBER);

  await document.transform(
    dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.TEXTURE] }),
    unpartition(),
  );

  return new Response(await nodeIO.writeBinary(document));
}

function applySkinNumber(document: Document, number: string) {
  const start = Math.ceil((SKIN_NUMBER_SLOTS - number.length) / 2) + 1;

  for (const node of document.getRoot().listNodes()) {
    const match = node.getName().match(/_number_\d+_(\d+)$/);

    if (!match) continue;

    const digit = number[Number(match[1]) - start];

    if (digit === undefined) {
      node.dispose();
      continue;
    }

    const cell = (Number(digit) + 9) % 10;
    const column = cell % DIGIT_COLUMNS;
    const row = Math.floor(cell / DIGIT_COLUMNS);

    node.traverse((child) => {
      for (const primitive of child.getMesh()?.listPrimitives() ?? []) {
        const uvs = primitive.getAttribute("TEXCOORD_0")?.clone();

        if (!uvs) continue;

        for (let index = 0; index < uvs.getCount(); index++) {
          const [u, v] = uvs.getElement(index, [0, 0]) as [number, number];

          uvs.setElement(index, [
            (column + u) / DIGIT_COLUMNS,
            (row + v) / DIGIT_ROWS,
          ]);
        }

        primitive.setAttribute("TEXCOORD_0", uvs);
      }
    });
  }
}
