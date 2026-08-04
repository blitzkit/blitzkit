import {
  Armor,
  BlitzCrewType,
  ChassisDefinitionsList,
  Crew,
  EngineDefinitionsList,
  GunDefinitionsList,
  ModelDefinitions,
  ResearchCost,
  TankParameters,
  toUniqueId,
  TurretDefinitionsList,
  Vector3,
  VehicleDefinitionArmor,
  VehicleDefinitionList,
  VehicleDefinitions,
} from "@blitzkit/core";
import { Cache } from "@blitzkit/core/src/blitzkit/api/server/0";
import { ServerBlitzKitAPI2 } from "@blitzkit/core/src/blitzkit/api/server/2";
import { parse as parsePath } from "path";
import { Vector3Tuple } from "three";

export abstract class ServerBlitzKitAPI3 extends ServerBlitzKitAPI2 {
  private vector3TupleToBlitzkit(tuple: Vector3Tuple) {
    return { x: tuple[0], y: tuple[1], z: tuple[2] } satisfies Vector3;
  }

  private assignArmor(
    raw: VehicleDefinitionArmor[string],
    id: number,
    armor: Armor,
  ) {
    if (typeof raw === "number") {
      armor.thickness[id] = raw;
    } else if (Array.isArray(raw)) {
      armor.thickness[id] = raw.at(-1)!;
    } else {
      if (!armor.spaced) armor.spaced = [];
      armor.thickness[id] = raw["#text"];
      armor.spaced.push(id);
    }
  }

  @Cache()
  async modelDefinitions() {
    const modelDefinitions = ModelDefinitions.create();

    for (const nation of this.nationsDir!) {
      const tankList = await this.vfs.xml<{ root: VehicleDefinitionList }>(
        `Data/XML/item_defs/vehicles/${nation}/list.xml`,
      );
      const turretList = await this.vfs.xml<{
        root: TurretDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/turrets.xml`);
      const gunList = await this.vfs.xml<{
        root: GunDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/guns.xml`);
      const enginesList = await this.vfs.xml<{
        root: EngineDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/engines.xml`);
      const chassisList = await this.vfs.xml<{
        root: ChassisDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/chassis.xml`);

      for (const tankKey in tankList.root) {
        if (this.botPattern.test(tankKey)) continue;

        const gunXps = new Map<number, ResearchCost>();
        const turretXps = new Map<number, ResearchCost>();
        const engineXps = new Map<number, ResearchCost>();
        const trackXps = new Map<number, ResearchCost>();
        const tank = tankList.root[tankKey];
        const tankDefinition = await this.vfs.xml<{ root: VehicleDefinitions }>(
          `Data/XML/item_defs/vehicles/${nation}/${tankKey}.xml`,
        );
        const tankParameters = await this.vfs.yaml<TankParameters>(
          `Data/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`,
        );
        const turretOrigin = tankDefinition.root.hull.turretPositions.turret
          .split(" ")
          .map(Number) as Vector3Tuple;
        const tankId = toUniqueId(nation, tank.id);

        const hullArmor: Armor = { spaced: [], thickness: {} };
        this.tankStringIdMap[`${nation}:${tankKey}`] = tankId;

        Object.keys(tankDefinition.root.hull.armor)
          .filter((name) => name.startsWith("armor_"))
          .forEach((name) => {
            const armorIdString = name.match(/armor_(\d+)/)?.[1];

            if (armorIdString === undefined) {
              throw new SyntaxError(`Invalid armor id: ${name}`);
            }

            const armorId = parseInt(armorIdString);
            const armorRaw = tankDefinition.root.hull.armor[name];

            this.assignArmor(armorRaw, armorId, hullArmor);
          });
        const crew: Crew[] = [];

        for (const crewKey in tankDefinition.root.crew) {
          const value = tankDefinition.root.crew[crewKey as BlitzCrewType];
          let entry: Crew;
          const index = crew.findIndex(
            ({ type }) => this.blitzkitCrewTypeToBlitz[type] === crewKey,
          );
          if (index === -1) {
            if (crewKey === "#text") continue;

            entry = {
              type: this.blitzCrewTypeToBlitzkit[crewKey as BlitzCrewType],
              count: 0,
              substitute: [],
            };
            crew.push(entry);
          } else {
            entry = crew[index];
          }

          if (typeof value === "string") {
            entry.count++;

            if (value !== "") {
              entry.substitute = value.split(/\n| /).map((member) => {
                return this.blitzCrewTypeToBlitzkit[
                  member.trim() as BlitzCrewType
                ];
              });
            }
          } else {
            if (entry.count === undefined) {
              entry.count = value.length;
            } else {
              entry.count += value.length;
            }
          }
        }

        modelDefinitions.models[tankId] = {
          armor: hullArmor,
          turret_origin: this.vector3TupleToBlitzkit(turretOrigin),
          initial_turret_rotation: tankDefinition.root.hull
            .turretInitialRotation
            ? {
                yaw: tankDefinition.root.hull.turretInitialRotation.yaw,
                pitch: tankDefinition.root.hull.turretInitialRotation.pitch,
                roll: tankDefinition.root.hull.turretInitialRotation.roll,
              }
            : undefined,
          bounding_box: {
            min: this.vector3TupleToBlitzkit(
              tankParameters.collision.hull.bbox.min,
            ),
            max: this.vector3TupleToBlitzkit(
              tankParameters.collision.hull.bbox.max,
            ),
          },
          turrets: {},
          tracks: {},
        };

        for (const key in tankDefinition.root.chassis) {
          const track = tankDefinition.root.chassis[key];
          const trackId = toUniqueId(nation, chassisList.root.ids[key]);
          const trackArmorRaw = track.armor.leftTrack;
          const hullOrigin = track.hullPosition
            .split(" ")
            .map(Number) as Vector3Tuple;

          modelDefinitions.models[tankId].tracks[trackId] = {
            thickness:
              typeof trackArmorRaw === "number"
                ? trackArmorRaw
                : trackArmorRaw["#text"],
            origin: this.vector3TupleToBlitzkit(hullOrigin),
          };
        }

        Object.keys(tankDefinition.root.turrets0).forEach((turretKey) => {
          const turret = tankDefinition.root.turrets0[turretKey];
          const turretModel = Number(
            parsePath(turret.models.undamaged).name.split("_")[1],
          );
          const turretId = toUniqueId(nation, turretList.root.ids[turretKey]);
          const turretYaw = (
            typeof turret.yawLimits === "string"
              ? turret.yawLimits
              : turret.yawLimits.at(-1)!
          )
            .split(" ")
            .map(Number) as [number, number];
          const gunOrigin = (
            typeof turret.gunPosition === "string"
              ? turret.gunPosition
              : turret.gunPosition[0]
          )
            .split(" ")
            .map(Number) as Vector3Tuple;
          const turretArmor: Armor = { thickness: {}, spaced: [] };

          Object.keys(turret.armor)
            .filter((name) => name.startsWith("armor_"))
            .forEach((name) => {
              const armorIdString = name.match(/armor_(\d+)/)?.[1];

              if (armorIdString === undefined) {
                throw new SyntaxError(`Invalid armor id: ${name}`);
              }

              const armorId = parseInt(armorIdString);
              const armorRaw = turret.armor[name];

              this.assignArmor(armorRaw, armorId, turretArmor);
            });

          turret.userString;

          modelDefinitions.models[tankId].turrets[turretId] = {
            armor: turretArmor,
            gun_origin: this.vector3TupleToBlitzkit(gunOrigin),
            model_id: turretModel,
            yaw:
              -turretYaw[0] + turretYaw[1] === 360
                ? undefined
                : { min: turretYaw[0], max: turretYaw[1] },
            guns: {},
            bounding_box: {
              min: this.vector3TupleToBlitzkit(
                tankParameters.collision[
                  parsePath(turret.hitTester.collisionModel).name.toLowerCase()
                ].bbox.min,
              ),
              max: this.vector3TupleToBlitzkit(
                tankParameters.collision[
                  parsePath(turret.hitTester.collisionModel).name.toLowerCase()
                ].bbox.max,
              ),
            },
          };

          Object.keys(turret.guns).forEach((gunKey, gunIndex) => {
            const gun = turret.guns[gunKey];
            const gunId = toUniqueId(nation, gunList.root.ids[gunKey]);
            const gunListEntry = gunList.root.shared[gunKey];
            const pitchLimitsRaw = gun.pitchLimits ?? gunListEntry.pitchLimits;
            const gunPitch = (
              typeof pitchLimitsRaw === "string"
                ? pitchLimitsRaw
                : pitchLimitsRaw.at(-1)!
            )
              .split(" ")
              .map(Number) as [number, number];
            const gunModel = Number(
              parsePath(gun.models.undamaged).name.split("_")[1],
            );
            const front = gun.extraPitchLimits?.front
              ? gun.extraPitchLimits.front.split(" ").map(Number)
              : undefined;
            const back = gun.extraPitchLimits?.back
              ? gun.extraPitchLimits.back.split(" ").map(Number)
              : undefined;
            const transition = gun.extraPitchLimits?.transition
              ? typeof gun.extraPitchLimits.transition === "number"
                ? gun.extraPitchLimits.transition
                : gun.extraPitchLimits.transition.at(-1)!
              : undefined;
            const gunArmor: Armor = { thickness: {}, spaced: [] };
            const maskName = `gun_${gunModel.toString().padStart(2, "0")}`;
            const maskEnabled =
              tankParameters.maskSlice?.[maskName]?.enabled ?? false;
            let mask: number | undefined;

            if (maskEnabled) {
              const maskRaw = tankParameters.maskSlice![maskName]!;
              mask = maskRaw.planePosition[1];
            } else {
              mask = undefined;
            }

            Object.keys(gun.armor)
              .filter((name) => name.startsWith("armor_"))
              .forEach((name) => {
                const armorIdString = name.match(/armor_(\d+)/)?.[1];
                if (armorIdString === undefined) {
                  throw new SyntaxError(`Invalid armor id: ${name}`);
                }
                const armorId = parseInt(armorIdString);
                const armorRaw = gun.armor[name];

                this.assignArmor(armorRaw, armorId, gunArmor);
              });

            modelDefinitions.models[tankId].turrets[turretId].guns[gunId] = {
              armor: gunArmor,
              model_id: gunModel,
              mask,
              thickness:
                gun.armor.gun === undefined
                  ? 0
                  : typeof gun.armor.gun === "number"
                    ? gun.armor.gun
                    : gun.armor.gun["#text"],
              pitch: {
                min: gunPitch[0],
                max: gunPitch[1],

                front: front
                  ? {
                      min: front[0],
                      max: front[1],
                      range: front[2],
                    }
                  : undefined,
                back: back
                  ? {
                      min: back[0],
                      max: back[1],
                      range: back[2],
                    }
                  : undefined,
                transition,
              },
            };
          });
        });
      }
    }

    return modelDefinitions;
  }
}
