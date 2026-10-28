import type { Material, Object3D } from "three";
import type { Skin } from "../../hooks/useSkin";
import { jsxTree } from "./jsxTree";

type Mergers = Parameters<typeof jsxTree>[1];

export function skinTree(
  node: Object3D,
  skin: Skin | undefined,
  mergers: Mergers,
) {
  const skinNodes = new Map(
    skin?.scene.children.map((node) => [node.name, node]),
  );
  const skinMergers: Mergers = {
    mesh(mesh, props, key) {
      const material = skin?.materials.get((mesh.material as Material).name);

      return mergers!.mesh!(
        mesh,
        material ? { ...props, material } : props,
        key,
      );
    },
    group(object3d, props, key) {
      const skinNode = skinNodes.get(object3d.name);
      const isSwitch = object3d.userData.state !== undefined;
      const state = skin
        ? skin.scene.userData.states[object3d.name]
        : object3d.userData.state;

      return (
        <group key={key} {...props}>
          {isSwitch
            ? object3d.children
                .filter((child) => child.name === state)
                .map((child) => jsxTree(child, skinMergers))
            : props.children}
          {skinNode?.children.map((child) => jsxTree(child, mergers))}
        </group>
      );
    },
  };

  return jsxTree(node, skinMergers);
}
