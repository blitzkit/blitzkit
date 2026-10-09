import type { Hierarchy } from "@blitzkit/core";
import { times } from "lodash-es";

export type MapComponent = Record<string, any>;

export const SELF_ENTITY = "*** Self ***";

export function indexedEntries<Type = MapComponent>(
  container: Record<string, any>,
  count: number,
) {
  return times(
    count,
    (index) => container[index.toString().padStart(4, "0")] as Type,
  );
}

export function hierarchyComponents(hierarchy: Hierarchy) {
  return indexedEntries(hierarchy.components, hierarchy.components.count);
}

export function findComponent(components: MapComponent[], typename: string) {
  return components.find(
    (component) => component["comp.typename"] === typename,
  );
}

export function hierarchyActions(hierarchy: Hierarchy) {
  return hierarchyComponents(hierarchy)
    .filter((component) => component["comp.typename"] === "ActionComponent")
    .flatMap((component) =>
      indexedEntries(component, component["ac.actionCount"]),
    );
}

export function findDescendant(
  hierarchy: Hierarchy,
  name: string,
): Hierarchy | undefined {
  for (const child of hierarchy["#hierarchy"] ?? []) {
    if (child.name === name) return child;

    const found = findDescendant(child, name);

    if (found) return found;
  }
}

export function resolveTarget(owner: Hierarchy, entityName: string) {
  return entityName === SELF_ENTITY
    ? owner
    : entityName
        .split("->")
        .reduce<Hierarchy | undefined>(
          (current, name) => current && findDescendant(current, name),
          owner,
        );
}

export function visitHierarchies(
  hierarchies: Hierarchy[],
  visitor: (hierarchy: Hierarchy) => void,
) {
  for (const hierarchy of hierarchies) {
    visitor(hierarchy);
    visitHierarchies(hierarchy["#hierarchy"] ?? [], visitor);
  }
}
