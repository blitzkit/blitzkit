import { parseHierarchies, type Sc2ReadStream } from "@blitzkit/core";
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
}

interface Action {
  "act.delay": number;
  "act.entityName": string;
  "act.event": number;
  "act.switchIndex": number;
  "act.type": number;
  "act.userEventId": string;
}

interface Entity {
  name: string;
  parent?: Entity;
  children: Entity[];
}

const SELF_ENTITY = "*** Self ***";
const SCENE_LOADED_EVENT = 1;
const USER_EVENT = 2;
const SWITCH_ACTIONS = [8, 9];
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
 * replays what picks each state switcher's state as a tank is shown in the
 * garage, with the camo's preset applied and its items attached; delayed
 * actions are skipped so states stay as they are when the tank appears
 */
export function switcherStates(
  sc2: ReturnType<Sc2ReadStream["sc2"]>,
  preset: string | undefined,
  attachments: Map<string, string[]>,
) {
  const scripts: Record<string, Script> = {};
  const stateNames = new Map<Entity, string[]>();
  const scenarios: { owner: Entity; script: Script }[] = [];
  const actions: { owner: Entity; action: Action }[] = [];
  const states: Record<string, string | null> = {};

  function activateState(entity: Entity | undefined, state: number) {
    const names = entity && stateNames.get(entity);

    if (names) states[entity.name] = names[state] ?? null;
  }

  for (const component of Object.values(
    sc2["#sceneComponents"] as unknown as Record<string, unknown>,
  ) as { "comp.typename"?: string; "ssc.scripts"?: Record<string, Script> }[]) {
    if (component?.["comp.typename"] !== "ScenarioSingletonComponent") continue;

    Object.assign(scripts, component["ssc.scripts"]);
  }

  parseHierarchies<Entity>(
    sc2["#hierarchy"],
    { name: "", children: [] },
    (hierarchy, components, parent) => {
      const entity: Entity = { name: hierarchy.name, parent, children: [] };

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

            if (script) scenarios.push({ owner: entity, script });
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
        }
      }

      return entity;
    },
  );

  function runScenario(
    { owner, script }: (typeof scenarios)[number],
    event: string,
  ) {
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
          return node["scenarioSceneInfoNode.infoKind"] === "GetCurrentEntity"
            ? owner
            : undefined;

        case "ScenarioGetMemberNode":
          return node["scenarioGetMemberNode.fieldName"] === "parent" &&
            pin === "parent"
            ? (input(id, "object") as Entity | undefined)?.parent
            : undefined;

        case "ScenarioFunctionNode":
          switch (
            `${node["scenarioFunctionNode.className"]}.${node["scenarioFunctionNode.functionName"]}`
          ) {
            case "Entity.FindChildByName": {
              const entity = input(id, "entity") as Entity | undefined;
              return entity && findChild(entity, input(id, "name") as string);
            }

            case "TankComponent.GetAppliedSkinMaterialConfigName":
              return preset;

            case "String.Compare":
              return input(id, "1") === input(id, "2");
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
      } else if (
        node["scenarioFunctionNode.functionName"] === "ActivateState"
      ) {
        activateState(
          input(id, "entity") as Entity | undefined,
          Number(input(id, "state")),
        );
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

      if (type === "ScenarioEventNode" && name === event) execute(id, 0);
    }
  }

  for (const event of LOAD_EVENTS) {
    for (const { owner, action } of actions) {
      if (
        action["act.delay"] === 0 &&
        SWITCH_ACTIONS.includes(action["act.type"]) &&
        (event === LOAD_EVENTS[0]
          ? action["act.event"] === SCENE_LOADED_EVENT
          : action["act.event"] === USER_EVENT &&
            action["act.userEventId"] === event)
      ) {
        activateState(
          resolveTarget(owner, action["act.entityName"]),
          action["act.switchIndex"],
        );
      }
    }

    for (const scenario of scenarios) runScenario(scenario, event);
  }

  return states;
}
