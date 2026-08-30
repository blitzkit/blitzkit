import { AvailableNationsYaml, GameDefinitions } from "@blitzkit/core";

import { Cache } from "./0_base";
import { ServerBlitzKitAPI8 } from "./8_skills";

export abstract class ServerBlitzKitAPI9 extends ServerBlitzKitAPI8 {
  @Cache()
  async game() {
    const gameDefinitions = GameDefinitions.create();

    const consumableNativeNames: Record<string, number> = {};
    const provisionNativeNames: Record<string, number> = {};

    Object.entries(this.consumablesCommon).forEach(([key, consumable]) => {
      consumableNativeNames[key] = consumable.id;
    });

    Object.entries(this.provisionsCommon).forEach(([key, provision]) => {
      provisionNativeNames[key] = provision.id;
    });

    const version = (await this.vfs.text("Data/version.txt")).split(" ")[0];

    gameDefinitions.version = version;
    gameDefinitions.nations = (
      await this.vfs.yaml<AvailableNationsYaml>("Data/available_nations.yaml")
    ).available_nations;

    for (const match of this.squadBattleTypeStyles!.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
      /"(\d+)" -> "(battleType\/([a-zA-Z]+))"/g,
    )) {
      const id = Number(match[1]);
      const name = this.getString(match[2]);

      gameDefinitions.gameModes[id] = {
        name,
      };
    }

    Object.entries(this.combatRoles!).forEach(([, value]) => {
      gameDefinitions.roles[value.id] = { provisions: [], consumables: [] };

      value.default_abilities.forEach((ability) => {
        if (ability in consumableNativeNames) {
          gameDefinitions.roles[value.id].consumables.push(
            consumableNativeNames[ability],
          );
        } else if (ability in provisionNativeNames) {
          gameDefinitions.roles[value.id].provisions.push(
            provisionNativeNames[ability],
          );
        } else throw new Error(`Unknown ability ${ability}`);
      });
    });

    return gameDefinitions;
  }
}
