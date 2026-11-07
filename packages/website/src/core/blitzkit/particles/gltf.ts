import type { AbstractVFS } from "@blitzkit/core/src/blitzkit/vfs/abstract";
import type { Document, Material, Node } from "@gltf-transform/core";
import { dirname } from "path/posix";
import sharp from "sharp";
import type { ParticleEffectExtras } from "./types";

const sprites = new WeakMap<Document, Map<string, Material>>();

// the first frame of an atlas, or a texture of its own
async function readSprite(vfs: AbstractVFS, spritePath: string) {
  const path = spritePath.replace("~res:/", "Data/");

  if (!(await vfs.resolve(`${path}.txt`))) {
    return await sharp(await vfs.file(`${path}.packed.webp`))
      .ensureAlpha()
      .webp({ lossless: true })
      .toBuffer();
  }

  const lines = (await vfs.text(`${path}.txt`)).split(/\r?\n/);
  const textureCount = Number(lines[0]);
  const [left, top, width, height, , , texture] = lines[textureCount + 3]
    .split(" ")
    .map(Number);
  const image = await vfs.file(`${dirname(path)}/${lines[texture + 1].trim()}`);

  return await sharp(image)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .webp({ lossless: true })
    .toBuffer();
}

async function spriteMaterial(
  document: Document,
  vfs: AbstractVFS,
  sprite: string,
) {
  let materials = sprites.get(document);

  if (!materials) {
    materials = new Map();
    sprites.set(document, materials);
  }

  let material = materials.get(sprite);

  if (!material) {
    const texture = document
      .createTexture(sprite)
      .setMimeType("image/webp")
      .setImage(await readSprite(vfs, sprite));

    material = document
      .createMaterial(sprite)
      .setBaseColorTexture(texture)
      .setExtras({ particleSprite: sprite });
    materials.set(sprite, material);
  }

  return material;
}

/**
 * keeps an effect on the node it plays from; its sprites come along on meshes
 * nothing draws, as glTF only carries textures that a material uses
 */
export async function addParticleEffect(
  document: Document,
  vfs: AbstractVFS,
  node: Node,
  effect: ParticleEffectExtras,
) {
  const buffer =
    document.getRoot().listBuffers()[0] ?? document.createBuffer();
  const used = new Set(
    effect.emitters.flatMap(({ layers }) => layers.map(({ sprite }) => sprite)),
  );

  for (const sprite of used) {
    const primitive = document
      .createPrimitive()
      .setMaterial(await spriteMaterial(document, vfs, sprite))
      .setAttribute(
        "POSITION",
        document
          .createAccessor()
          .setType("VEC3")
          .setArray(new Float32Array(9))
          .setBuffer(buffer),
      );

    node.addChild(
      document
        .createNode(sprite)
        .setMesh(document.createMesh().addPrimitive(primitive)),
    );
  }

  node.setExtras({ ...node.getExtras(), particleEffect: effect });
}
