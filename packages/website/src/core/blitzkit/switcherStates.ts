import {
  parseHierarchies,
  type Hierarchy,
  type Sc2ReadStream,
} from "@blitzkit/core";
import { times } from "lodash-es";

interface Value {
  "any.type": string;
  "any.value": unknown;
}

interface ScriptNode {
  type: string;
  node: Record<string, unknown> & { defaults?: Record<string, Value> };
  connections?: Record<
    string,
    { pinIn: string; pinOut: string; target: string }
  >;
}

interface Script {
  nodes: Record<string, ScriptNode>;
  variables?: Record<string, Value>;
}

interface Action {
  "act.delay": number;
  "act.entityName": string;
  "act.event": number;
  "act.eventToTrigger": string;
  "act.stopAfterNRepeats": number;
  "act.switchIndex": number;
  "act.type": number;
  "act.userEventId": string;
}

interface Entity {
  name: string;
  parent?: Entity;
  children: Entity[];
  hierarchy?: Hierarchy;
  repeats?: number;
}

const SELF_ENTITY = "*** Self ***";
const SCENE_LOADED_EVENT = 1;
const USER_EVENT = 2;
const ANIMATION_END_EVENTS = [3, 8];
const START_ANIMATION_ACTION = 6;
const SWITCH_ACTIONS = [8, 9];
const TRIGGER_EVENT_ACTION = 10;
// what the game fires as a tank is shown in the garage, in order
const LOAD_EVENTS = ["Added", "TankAliveInHangar", "TankIsShownInNewScreen"];
const MAX_DEPTH = 64;

function findChild(entity: Entity, name: string): Entity | undefined {
  for (const child of entity.children) {
    if (child.name === name) return child;

    const found = findChild(child, name);

    if (found) return found;
  }
}

function resolveTarget(owner: Entity, entityName: string) {
  if (entityName === SELF_ENTITY) return owner;

  const [first, ...rest] = entityName.split("->");
  let target: Entity | undefined;

  for (
    let ancestor: Entity | undefined = owner;
    ancestor && !target;
    ancestor = ancestor.parent
  ) {
    target = ancestor.name === first ? ancestor : findChild(ancestor, first);
  }

  for (const name of rest) target = target && findChild(target, name);

  return target;
}

/**
 * replays what the game does as a tank is shown in the garage, with the camo's
 * preset applied and its items attached; `animate` follows customization parts
 * through their motions, delays and alarms until they settle
 */
function replay(
  sc2: ReturnType<Sc2ReadStream["sc2"]>,
  preset: string | undefined,
  attachments: Map<string, string[]>,
  animate: boolean,
) {
  const scripts: Record<string, Script> = {};
  const root: Entity = { name: "", children: [] };
  const stateNames = new Map<Entity, string[]>();
  const scenarios: {
    owner: Entity;
    script: Script;
    variables: Map<string, unknown>;
  }[] = [];
  const actions: { owner: Entity; action: Action }[] = [];
  const states: Record<string, string | null> = {};
  const looping = new Set<Entity>();
  const pending: (() => void)[] = [];
  const fired = new Set<unknown>();

  function activateState(entity: Entity | undefined, state: number) {
    const names = entity && stateNames.get(entity);

    if (!names) return;

    const previous = states[entity.name];

    states[entity.name] = names[state] ?? null;

    if (!animate || previous === states[entity.name]) return;

    for (const scenario of scenarios) {
      if (scenario.owner === entity) {
        runScenario(scenario, "State Activated", state);
      }
    }
  }

  function isShown(entity: Entity) {
    for (let child = entity; child.parent; child = child.parent) {
      if (
        stateNames.get(child.parent)?.includes(child.name) &&
        states[child.parent.name] !== child.name
      ) {
        return false;
      }
    }

    return true;
  }

  function startAnimation(entity: Entity, repeats?: number) {
    if (entity.repeats === undefined) {
      for (const child of entity.children) startAnimation(child, repeats);
      return;
    }

    // some clips restart themselves when they end
    if (looping.has(entity)) return;

    looping.add(entity);

    if ((repeats ?? entity.repeats) > 0) {
      pending.push(() => finishAnimation(entity));
    }
  }

  function finishAnimation(entity: Entity) {
    const statesBefore = { ...states };
    const shownBefore = [...looping].filter(isShown);

    for (const { owner, action } of actions) {
      if (
        owner === entity &&
        ANIMATION_END_EVENTS.includes(action["act.event"])
      ) {
        runAction(owner, action);
      }
    }

    for (
      let ancestor: Entity | undefined = entity;
      ancestor;
      ancestor = ancestor.parent
    ) {
      const owned = scenarios.filter(({ owner }) => owner === ancestor);

      for (const scenario of owned) {
        runScenario(scenario, "Motion Fragment Stop");
        runScenario(scenario, "Motion Sequence Stop");
      }

      if (owned.length > 0) break;
    }

    // an intro hands over to whatever it revealed; with nothing to hand over
    // to, it's the only animation there is so it keeps looping
    if (
      [...looping].some(
        (other) => isShown(other) && !shownBefore.includes(other),
      )
    ) {
      looping.delete(entity);
    } else {
      Object.assign(states, statesBefore);
    }
  }

  function runAction(owner: Entity, action: Action) {
    const target = resolveTarget(owner, action["act.entityName"]);

    if (SWITCH_ACTIONS.includes(action["act.type"])) {
      // what shows for a while in game stays, as its animation loops here
      if (action["act.delay"] > 0 && action["act.switchIndex"] < 0) return;

      activateState(target, action["act.switchIndex"]);
    } else if (animate && action["act.type"] === START_ANIMATION_ACTION) {
      if (target) {
        const repeats = action["act.stopAfterNRepeats"];

        startAnimation(target, repeats > 0 ? repeats : undefined);
      }
    } else if (animate && action["act.type"] === TRIGGER_EVENT_ACTION) {
      fireEvent(action["act.eventToTrigger"]);
    }
  }

  for (const component of Object.values(
    sc2["#sceneComponents"] as unknown as Record<string, unknown>,
  ) as { "comp.typename"?: string; "ssc.scripts"?: Record<string, Script> }[]) {
    if (component?.["comp.typename"] !== "ScenarioSingletonComponent") continue;

    Object.assign(scripts, component["ssc.scripts"]);
  }

  parseHierarchies<Entity>(
    sc2["#hierarchy"],
    root,
    (hierarchy, components, parent) => {
      const entity: Entity = {
        name: hierarchy.name,
        parent,
        children: [],
        hierarchy,
      };

      parent.children.push(entity);

      for (const item of attachments.get(hierarchy.name) ?? []) {
        entity.children.push({ name: item, parent: entity, children: [] });
      }

      for (const component of components) {
        switch (component["comp.typename"]) {
          case "StateSwitcherComponent": {
            const names = times(
              component["ssc.statesCount"],
              (index) => component[`ssc.state${index}`],
            );

            stateNames.set(entity, names);
            states[entity.name] = names[component["ssc.activeState"]] ?? null;
            break;
          }

          case "ScenarioComponent": {
            const script = scripts[component["scenario.scriptId"]];

            if (script) {
              scenarios.push({
                owner: entity,
                script,
                variables: new Map(
                  Object.entries(script.variables ?? {}).map(
                    ([name, variable]) => [name, variable["any.value"]],
                  ),
                ),
              });
            }
            break;
          }

          case "ActionComponent":
            times(component["ac.actionCount"], (index) => {
              actions.push({
                owner: entity,
                action: component[index.toString().padStart(4, "0")] as Action,
              });
            });
            break;

          case "MotionComponent":
            if (animate) {
              entity.repeats = component["simpleMotion.repeatsCount"];
            }
            break;
        }
      }

      return entity;
    },
  );

  function runScenario(
    scenario: (typeof scenarios)[number],
    event: string,
    value?: number,
  ) {
    const { owner, script, variables } = scenario;
    const { nodes } = script;
    const links = (id: string) => Object.values(nodes[id].connections ?? {});

    function input(id: string, pin: string): unknown {
      const link = links(id).find((link) => link.pinIn === pin);

      return link
        ? output(link.target, link.pinOut)
        : nodes[id].node.defaults?.[pin]?.["any.value"];
    }

    function output(id: string, pin: string): unknown {
      const { type, node } = nodes[id];

      switch (type) {
        case "ScenarioSceneInfoNode":
          switch (node["scenarioSceneInfoNode.infoKind"]) {
            case "GetCurrentEntity":
              return owner;
            case "GetCurrentScene":
              return root;
          }
          return undefined;

        case "ScenarioGetVarNode":
          return variables.get(node["scenarioGetVarNode.varPath"] as string);

        case "ScenarioSetVarNode":
          return variables.get(node["scenarioSetVarNode.varPath"] as string);

        case "ScenarioGetMemberNode": {
          const object = input(id, "object") as Entity | undefined;

          switch (node["scenarioGetMemberNode.fieldName"]) {
            case "parent":
              return pin === "parent" ? object?.parent : undefined;
            case "name":
              return object?.name;
            case "stateSwitcherVisibility":
              return object && isShown(object);
          }
          return undefined;
        }

        case "ScenarioFunctionNode": {
          const name = node["scenarioFunctionNode.functionName"] as string;
          const number = (pin: string) => Number(input(id, pin) ?? 0);

          switch (`${node["scenarioFunctionNode.className"]}.${name}`) {
            case "Entity.FindChildByName": {
              const entity = input(id, "entity") as Entity | undefined;
              return entity && findChild(entity, input(id, "name") as string);
            }

            case "Entity.GetVisibility": {
              const entity = input(id, "arg0") as Entity | undefined;
              return entity ? isShown(entity) : false;
            }

            case "TankComponent.GetAppliedSkinMaterialConfigName":
              return preset;

            case "String.Compare":
              return input(id, "1") === input(id, "2");

            case "String.Merge":
              // graphs use Separator as the prefix and Postfix as the number
              return ["Suffix", "Separator", "Postfix"]
                .map((pin) => input(id, pin) ?? "")
                .join("");

            case "bool.Or":
              return Boolean(input(id, "a")) || Boolean(input(id, "b"));

            case "Random.Random":
            case "Random.RandomFloat":
            case "TankComponent.GetSpeed":
            case "TankComponent.GetTurretAngle":
            case "TankComponent.GetGunAngle":
              return 0;
          }

          if (name === "==") return number("a") === number("b");
          if (name === ">") return number("a") > number("b");
          if (name === ">=") return number("a") >= number("b");
          if (name === "<=") return number("a") <= number("b");
          if (name.startsWith("Add")) return number("a") + number("b");
          if (name.startsWith("Subtract")) return number("a") - number("b");
        }
      }
    }

    function execute(id: string, depth: number) {
      if (depth > MAX_DEPTH) return;

      const { type, node } = nodes[id];
      let pin = "exit";

      if (type === "ScenarioEventNode") {
        pin = "event";
      } else if (type === "ScenarioBranchNode") {
        pin = input(id, "condition") ? "true" : "false";
      } else if (type === "ScenarioSetVarNode") {
        variables.set(
          node["scenarioSetVarNode.varPath"] as string,
          input(id, "set"),
        );
      } else if (type === "ScenarioSetAlarmClockNode") {
        const entity = (input(id, "entity") as Entity | undefined) ?? owner;

        // alarms re-arm themselves
        if (animate && !fired.has(node)) {
          fired.add(node);
          pending.push(() => {
            for (const other of scenarios) {
              if (other.owner === entity) runScenario(other, "Alarm Clock");
            }
          });
        }
      } else {
        const entity = input(id, "entity") as Entity | undefined;

        switch (node["scenarioFunctionNode.functionName"]) {
          case "ActivateState":
            activateState(entity, Number(input(id, "state")));
            break;

          case "StartAnimation":
            if (animate && entity) {
              startAnimation(entity, Number(input(id, "repeats") ?? 0));
            }
            break;

          case "TriggerCustomEvent":
            if (animate) fireEvent(input(id, "event name") as string);
            break;
        }
      }

      for (const link of links(id)) {
        if (link.pinIn === pin) execute(link.target, depth + 1);
      }
    }

    for (const id in nodes) {
      const { type, node } = nodes[id];
      const name =
        node["ScenarioEventNode.eventName"] === "Custom"
          ? node.defaults?.["Event Name"]?.["any.value"]
          : node["ScenarioEventNode.eventName"];

      if (
        type === "ScenarioEventNode" &&
        name === event &&
        (event !== "State Activated" ||
          Number(node.defaults?.State?.["any.value"] ?? 0) === value)
      ) {
        execute(id, 0);
      }
    }
  }

  function fireEvent(event: string) {
    if (fired.has(event)) return;

    fired.add(event);

    for (const { owner, action } of actions) {
      if (
        (animate || action["act.delay"] === 0) &&
        (event === LOAD_EVENTS[0]
          ? action["act.event"] === SCENE_LOADED_EVENT
          : action["act.event"] === USER_EVENT &&
            action["act.userEventId"] === event)
      ) {
        runAction(owner, action);
      }
    }

    for (const scenario of scenarios) runScenario(scenario, event);
  }

  for (const event of LOAD_EVENTS) fireEvent(event);

  for (let run = pending.shift(); run; run = pending.shift()) run();

  return {
    states,
    motions: new Set(
      [...looping]
        .filter(isShown)
        .map((entity) => entity.hierarchy as Hierarchy),
    ),
  };
}

/**
 * picks each state switcher's state; delayed actions are skipped so states stay
 * as they are when the tank appears
 */
export function switcherStates(
  sc2: ReturnType<Sc2ReadStream["sc2"]>,
  preset: string | undefined,
  attachments: Map<string, string[]>,
) {
  return replay(sc2, preset, attachments, false).states;
}

/** where a customization part ends up: its states and the motions left looping */
export function partGarage(
  sc2: ReturnType<Sc2ReadStream["sc2"]>,
  preset: string | undefined,
) {
  return replay(sc2, preset, new Map(), true);
}
