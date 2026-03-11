import type { ComponentProps, ReactNode } from "react";
import { Mesh, MeshStandardMaterial, Object3D } from "three";

export function jsxTree(
  node: Object3D,
  mergers?: {
    mesh?: (
      mesh: Mesh,
      props: ComponentProps<"mesh">,
      key: string,
    ) => ReactNode;
    group?: (
      object3d: Object3D,
      props: ComponentProps<"group">,
      key: string,
    ) => ReactNode;
  },
): ReactNode {
  if (node instanceof Mesh) {
    const props = {
      geometry: node.geometry,
      material: node.material,
      position: node.position,
      rotation: node.rotation,
      scale: node.scale,
    };

    if (props.material instanceof MeshStandardMaterial) {
      props.material.depthWrite = true;
    }

    return mergers?.mesh ? (
      mergers.mesh(node, props, node.uuid)
    ) : (
      <mesh key={node.uuid} {...props} />
    );
  } else if (node instanceof Object3D) {
    const props = {
      position: node.position,
      rotation: node.rotation,
      scale: node.scale,
      children: node.children.map((child) => jsxTree(child, mergers)),
    };

    return mergers?.group ? (
      mergers.group(node, props, node.uuid)
    ) : (
      <group key={node.uuid} {...props} />
    );
  }

  return null;
}
