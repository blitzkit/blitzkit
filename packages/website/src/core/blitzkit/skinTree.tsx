import type { Material, Object3D } from "three";
import type { Skin } from "../../hooks/useSkin";
import { jsxTree } from "./jsxTree";

type Mergers = Parameters<typeof jsxTree>[1];

// names get sanitized and made unique on load
function nameOf(object3d: Object3D): string {
  return object3d.userData.name ?? object3d.name;
}

/**
 * skins are layered in order, so an attachment's states win over the
 * camouflage's
 */
export function skinTree(node: Object3D, skins: Skin[], mergers: Mergers) {
  const skinNodes = new Map<string, Object3D[]>();
  const materials = new Map<string, Material>();
  const states: Record<string, string | null> = {};

  for (const skin of skins) {
    for (const node of skin.scene.children) {
      skinNodes.set(node.name, [...(skinNodes.get(node.name) ?? []), node]);
    }

    for (const [name, material] of skin.materials) {
      materials.set(name, material);
    }

    Object.assign(states, skin.scene.userData.states);
  }

  function switchChildren(object3d: Object3D, childMergers: Mergers) {
    if (object3d.userData.state === undefined) return;

    const name = nameOf(object3d);
    const state = name in states ? states[name] : object3d.userData.state;

    return object3d.children
      .filter((child) => nameOf(child) === state)
      .map((child) => jsxTree(child, childMergers));
  }

  const partMergers: Mergers = {
    ...mergers,
    group(object3d, props, key) {
      return (
        <group key={key} {...props}>
          {switchChildren(object3d, partMergers) ?? props.children}
        </group>
      );
    },
  };
  const skinMergers: Mergers = {
    mesh(mesh, props, key) {
      const material = materials.get((mesh.material as Material).name);

      return mergers!.mesh!(
        mesh,
        material ? { ...props, material } : props,
        key,
      );
    },
    group(object3d, props, key) {
      const parts = skinNodes.get(object3d.name) ?? [];

      return (
        <group key={key} {...props}>
          {switchChildren(object3d, skinMergers) ?? props.children}
          {parts.flatMap((part) =>
            part.children.map((child) => jsxTree(child, partMergers)),
          )}
        </group>
      );
    },
  };

  return jsxTree(node, skinMergers);
}
