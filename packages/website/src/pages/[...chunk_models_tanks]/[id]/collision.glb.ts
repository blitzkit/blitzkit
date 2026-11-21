import {
  parseHierarchies,
  Sc2ReadStream,
  ScgReadStream,
  toUniqueId,
  type VehicleDefinitionList,
} from "@blitzkit/core";
import type { AbstractVFS } from "@blitzkit/core/src/blitzkit/vfs/abstract";
import { Document, Node, NodeIO, Scene } from "@gltf-transform/core";
import type { APIContext } from "astro";
import { Sc2ComponentHandler } from "../../../core/blitzkit/sc2Components";
import { vfs } from "../../../core/blitzkit/vfs";

export { getStaticPaths } from "./_index";

export async function GET({ props }: APIContext<{ id: number }>) {
  const nodeIO = new NodeIO();
  const nations = await vfs
    .dir(`Data/XML/item_defs/vehicles`)
    .then((files) => files.filter((nation) => nation !== "common"));

  for (const nation of nations) {
    const tanks = await vfs.xml<{ root: VehicleDefinitionList }>(
      `Data/XML/item_defs/vehicles/${nation}/list.xml`,
    );

    for (const tankKey in tanks.root) {
      const tank = tanks.root[tankKey];

      if (tankKey.includes("tutorial_bot")) continue;

      const id = toUniqueId(nation, tank.id);

      if (id !== props.id) continue;

      const model = await extractArmor(vfs, `${nation}-${tankKey}`);
      const bytes = await nodeIO.writeBinary(model);

      return new Response(bytes);
    }
  }
}

async function extractArmor(vfs: AbstractVFS, fileName: string) {
  const sc2Path = `Data/3d/Tanks/CollisionMeshes/${fileName}.sc2`;
  const scgPath = `Data/3d/Tanks/CollisionMeshes/${fileName}.scg`;
  const sc2 = new Sc2ReadStream(
    (await vfs.file(sc2Path)).buffer as ArrayBuffer,
  ).sc2();
  const scg = new ScgReadStream(
    (await vfs.file(scgPath)).buffer as ArrayBuffer,
  ).scg();
  const document = new Document();
  const scene = document.createScene();
  const buffer = document.createBuffer();
  const handler = new Sc2ComponentHandler({
    document,
    buffer,
    scg,
    render: { kind: "collision" },
    strict: true,
  });

  parseHierarchies<Scene | Node>(
    sc2["#hierarchy"],
    scene,
    (hierarchy, components, parent) => {
      /**
       * Consumers (nameToArmorId and friends) expect a flat list of
       * `<hierarchy>_armor_<n>` nodes under the scene, so the hierarchy node
       * is only a scratch holder: its armor children are hoisted out of it
       * and it is never attached.
       */
      const holder = document.createNode(hierarchy.name);

      handler.handle(hierarchy, components, holder);
      holder.listChildren().forEach((armor) => scene.addChild(armor));

      return parent;
    },
  );

  return document;
}
