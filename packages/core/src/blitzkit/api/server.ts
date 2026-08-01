import {
  AbstractVFS,
  AvailableNationsYaml,
  SquadBattleTypeStylesYaml,
} from "@blitzkit/core";
import { GameDefinitions } from "../../protos";
import { BlitzKitAPI } from "./base";

export class ServerBlitzKitAPI extends BlitzKitAPI {
  vfs: AbstractVFS;

  constructor(vfs: AbstractVFS) {
    super();

    this.vfs = vfs;
  }

  async game() {
    const versionFile = await this.vfs.text("Data/version.txt");
    const version = versionFile.split(" ")[0];

    const availableNations = await this.vfs.yaml<AvailableNationsYaml>(
      "Data/available_nations.yaml",
    );
    const nations = availableNations.available_nations;

    const game: GameDefinitions = {
      version,
      nations,
      gameModes: {},
      roles: {},
    };

    const squadBattleTypeStyles =
      await this.vfs.yaml<SquadBattleTypeStylesYaml>(
        `Data/UI/Screens3/Lobby/Hangar/Squad/SquadBattleType.yaml`,
      );

    for (const match of squadBattleTypeStyles.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
      /"(\d+)" -> "(battleType\/([a-zA-Z]+))"/g,
    )) {
      const id = Number(match[1]);
      const name = getString(match[2]);

      gameModeNativeNames[match[3]] = id;
      game.gameModes[id] = {
        name,
      };
    }

    Object.entries(combatRoles).forEach(([, value]) => {
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

    return game;
  }
}
