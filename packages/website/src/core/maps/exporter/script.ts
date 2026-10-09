import type { Hierarchy } from "@blitzkit/core";
import type { ActionStart, Animator } from "./animation";
import {
  hierarchyActions,
  resolveTarget,
  visitHierarchies,
  type MapComponent,
} from "./hierarchy";

export const SCENE_LOADED_EVENT = 1;
const USER_EVENT = 2;
const ANIMATION_END_EVENT = 3;
export const PARTICLE_START_ACTION = 1;
const ANIMATION_START_ACTION = 6;
const STATE_SWITCH_ACTION = 9;
const TRIGGER_EVENT_ACTION = 10;
const BATTLE_START_EVENT = "onBattleStart";
const BATTLE_DURATION = 7 * 60;

export type StateSwitch = [time: number, state: number];

export interface MapScript {
  animationStarts: Map<Hierarchy, ActionStart>;
  stateSwitches: Map<Hierarchy, StateSwitch[]>;
}

export function compileScript(
  hierarchies: Hierarchy[],
  animator: Animator,
): MapScript {
  const animationStarts = new Map<Hierarchy, ActionStart>();
  const stateSwitches = new Map<Hierarchy, StateSwitch[]>();
  const fired = new Set<string>();

  function run(owner: Hierarchy, action: MapComponent, eventTime: number) {
    const time = eventTime + action["act.delay"];
    const target = resolveTarget(owner, action["act.entityName"]);

    if (time > BATTLE_DURATION) return;

    switch (action["act.type"]) {
      case ANIMATION_START_ACTION: {
        if (!target || animationStarts.has(target)) return;

        const length = animator.length(target, action);

        animationStarts.set(target, { action, time });

        if (Number.isFinite(length)) {
          fire(target, ANIMATION_END_EVENT, time + length);
        }

        break;
      }

      case STATE_SWITCH_ACTION: {
        if (!target) return;
        if (!stateSwitches.has(target)) stateSwitches.set(target, []);

        stateSwitches.get(target)!.push([time, action["act.switchIndex"]]);
        break;
      }

      case TRIGGER_EVENT_ACTION: {
        fireUserEvent(action["act.eventToTrigger"], time);
        break;
      }
    }
  }

  function fire(owner: Hierarchy, event: number, time: number) {
    const key = `${owner.id}:${event}:${time}`;

    if (fired.has(key)) return;

    fired.add(key);

    for (const action of hierarchyActions(owner)) {
      if (action["act.event"] === event) run(owner, action, time);
    }
  }

  function fireUserEvent(name: string, time: number) {
    const key = `${name}:${time}`;

    if (fired.has(key)) return;

    fired.add(key);
    visitHierarchies(hierarchies, (hierarchy) => {
      for (const action of hierarchyActions(hierarchy)) {
        if (
          action["act.event"] === USER_EVENT &&
          action["act.userEventId"] === name
        ) {
          run(hierarchy, action, time);
        }
      }
    });
  }

  visitHierarchies(hierarchies, (hierarchy) =>
    fire(hierarchy, SCENE_LOADED_EVENT, 0),
  );
  fireUserEvent(BATTLE_START_EVENT, 0);

  for (const switches of stateSwitches.values()) {
    switches.sort(([a], [b]) => a - b);
  }

  return { animationStarts, stateSwitches };
}
