import {
  AugmentNodeType,
  type AugmentNode,
  type AugmentProgression,
  type TankDefinition,
} from "@blitzkit/protos";
import type { TankState } from "./tankState";

function isAlternative(node: AugmentNode) {
  return node.type === AugmentNodeType.AUGMENT_NODE_TYPE_ALTERNATIVE;
}

// Alternatives live in the final group, outside the grid
export function listAugmentNodes({ nodes, group }: AugmentProgression) {
  return [...nodes, ...(group?.alternatives ?? [])];
}

// Standing in for the final group, which has no id of its own
export const AUGMENT_GROUP_ID = -1;

function directPrerequisites(
  progression: AugmentProgression,
  node: AugmentNode,
) {
  const byTechName = new Map(
    progression.nodes.map((other) => [other.tech_name, other.id]),
  );
  const requires = isAlternative(node)
    ? progression.group?.requires ?? []
    : node.requires;

  return requires.flatMap(({ tech_name }) => byTechName.get(tech_name) ?? []);
}

// Everything the given nodes stand on, the nodes themselves included
function foundations(progression: AugmentProgression, ids: number[]) {
  const byId = new Map(
    listAugmentNodes(progression).map((node) => [node.id, node]),
  );
  const found = new Set<number>();
  const pending = [...ids];

  while (pending.length > 0) {
    const id = pending.pop()!;
    const node = byId.get(id);

    if (found.has(id) || node === undefined) continue;

    found.add(id);
    pending.push(...directPrerequisites(progression, node));
  }

  return found;
}

/**
 * Like picking a module: choosing an augment installs everything on the way to
 * it. Choosing one that is already installed steps back to it by removing
 * what was built on top, and removes it too once nothing is left on top. The
 * final group is a choice, so installing one alternative replaces the other.
 */
export function toggleAugment(
  draft: Pick<TankState, "augments">,
  progression: AugmentProgression,
  id: number,
) {
  const nodes = listAugmentNodes(progression);
  const installed = new Set(draft.augments);
  const alternatives = new Set(
    progression.group?.alternatives.map((alternative) => alternative.id),
  );

  if (id === AUGMENT_GROUP_ID) {
    const { group } = progression;

    if (group === undefined) return;

    const needed = directPrerequisites(progression, group.alternatives[0]);

    if (needed.every((other) => installed.has(other))) {
      // Already there, so back out of the choice
      draft.augments = draft.augments.filter(
        (other) => !alternatives.has(other),
      );
    } else {
      for (const other of foundations(progression, needed))
        installed.add(other);

      draft.augments = [...installed];
    }

    return;
  }

  const node = nodes.find((candidate) => candidate.id === id);

  if (node === undefined) return;

  if (!installed.has(id)) {
    for (const other of foundations(progression, [id])) installed.add(other);

    if (alternatives.has(id)) {
      for (const other of alternatives)
        if (other !== id) installed.delete(other);
    }

    draft.augments = [...installed];

    return;
  }

  // Everything installed that stands on this one, however far up
  const above = new Set<number>();
  let grew = true;

  while (grew) {
    grew = false;

    for (const other of nodes) {
      if (!installed.has(other.id) || above.has(other.id)) continue;

      const stands = directPrerequisites(progression, other).some(
        (prerequisite) => prerequisite === id || above.has(prerequisite),
      );

      if (!stands) continue;

      above.add(other.id);
      grew = true;
    }
  }

  const removed = above.size > 0 ? above : new Set([id]);

  draft.augments = draft.augments.filter((other) => !removed.has(other));
}

// Everything in the grid. The final group still needs a choice
export function createAugments(progression?: AugmentProgression) {
  if (!progression) return [];
  return progression.nodes.map((node) => node.id);
}

// Every value the installed augments give each attribute, keyed by the
// attribute's name without the `ATTRIBUTE_NAME_` prefix
export function augmentAttributes(
  { augment_progression }: TankDefinition,
  state: TankState,
) {
  const attributes = new Map<string, number[]>();

  if (augment_progression === undefined) return attributes;

  const installed = new Set(state.augments);

  for (const node of listAugmentNodes(augment_progression)) {
    if (!installed.has(node.id)) continue;

    for (const { name, value } of node.attributes) {
      const key = name.replace(/^ATTRIBUTE_NAME_/, "");

      if (!attributes.has(key)) attributes.set(key, []);

      attributes.get(key)!.push(value);
    }
  }

  return attributes;
}

// Slots are the position of the shell in the gun's list, counted from 1
export function shellSlot(
  gun: { shells: { id: number }[] },
  shell: { id: number },
) {
  return gun.shells.findIndex(({ id }) => id === shell.id) + 1;
}
