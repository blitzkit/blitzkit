import {
  AbstractVFS,
  Armor,
  AssaultRanges,
  BlitzCrewType,
  BlitzModuleType,
  BlitzStrings,
  BlitzTankClass,
  CamouflageDefinitions,
  CamouflagesXml,
  CamouflagesYaml,
  ChassisDefinitionsList,
  CombatRolesYaml,
  ConsumableDefinitions,
  ConsumablesCommon,
  Crew,
  CrewType,
  EngineDefinitionsList,
  Equalizer,
  EquipmentDefinitions,
  GunDefinition,
  GunDefinitionsList,
  I18nString,
  MapDefinitions,
  MapsYaml,
  ModelDefinitions,
  ModuleType,
  OptionalDevices,
  OptionalDeviceSlots,
  ProvisionDefinitions,
  ProvisionsCommon,
  ResearchCost,
  ShellDefinitionsList,
  ShellKind,
  ShellType,
  SkillDefinitions,
  sluggify,
  SquadBattleTypeStylesYaml,
  TankClass,
  TankDefinitions,
  TankmenAvatar,
  TankParameters,
  TankPrice,
  TankPriceType,
  TankType,
  toUniqueId,
  TurretDefinitionsList,
  Unlock,
  UnlocksListing,
  VehicleDefinitionArmor,
  VehicleDefinitionList,
  VehicleDefinitions,
} from "@blitzkit/core";
import { SUPPORTED_LOCALE_BLITZ_MAP } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import { parse as parsePath } from "path";
import { parse as parseYaml } from "yaml";
import { BlitzKitAPI } from "./base";

export class ServerBlitzKitAPI extends BlitzKitAPI {
  private vfs: AbstractVFS;

  private nationSlugDiscriminators = {
    china: "cn",
    european: "eu",
    france: "fr",
    germany: "de",
    japan: "jp",
    other: "ot",
    uk: "gb",
    usa: "us",
    ussr: "ru",
  };
  private blitzModuleTypeToBlitzkit: Record<keyof BlitzModuleType, ModuleType> =
    {
      chassis: ModuleType.MODULE_TYPE_TRACKS,
      engine: ModuleType.MODULE_TYPE_ENGINE,
      gun: ModuleType.MODULE_TYPE_GUN,
      turret: ModuleType.MODULE_TYPE_TURRET,
      vehicle: ModuleType.MODULE_TYPE_VEHICLE,
    };
  private blitzkitCrewTypeToBlitz: Record<CrewType, BlitzCrewType> = {
    [CrewType.CREW_TYPE_COMMANDER]: "commander",
    [CrewType.CREW_TYPE_DRIVER]: "driver",
    [CrewType.CREW_TYPE_GUNNER]: "gunner",
    [CrewType.CREW_TYPE_LOADER]: "loader",
    [CrewType.CREW_TYPE_RADIOMAN]: "radioman",
  };
  private blitzCrewTypeToBlitzkit: Record<BlitzCrewType, CrewType> = {
    commander: CrewType.CREW_TYPE_COMMANDER,
    driver: CrewType.CREW_TYPE_DRIVER,
    gunner: CrewType.CREW_TYPE_GUNNER,
    loader: CrewType.CREW_TYPE_LOADER,
    radioman: CrewType.CREW_TYPE_RADIOMAN,
  };
  private blitzTankClassToBlitzkit: Record<BlitzTankClass, TankClass> = {
    lightTank: TankClass.TANK_CLASS_LIGHT,
    "AT-SPG": TankClass.TANK_CLASS_TANK_DESTROYER,
    heavyTank: TankClass.TANK_CLASS_HEAVY,
    mediumTank: TankClass.TANK_CLASS_MEDIUM,
  };
  private blitzShellKindToBlitzkit: Record<ShellKind, ShellType> = {
    ARMOR_PIERCING: ShellType.SHELL_TYPE_AP,
    ARMOR_PIERCING_CR: ShellType.SHELL_TYPE_APCR,
    HIGH_EXPLOSIVE: ShellType.SHELL_TYPE_HE,
    HOLLOW_CHARGE: ShellType.SHELL_TYPE_HEAT,
  };

  private stringsI18n: Record<string, Record<string, string>> = {};
  private nationsDir?: string[];
  private tankStringIdMap: Record<string, number> = {};
  private consumablesCommon: ConsumablesCommon = {};
  private provisionsCommon: ProvisionsCommon = {};

  // TODO: suffix with "yaml"s and "xml"s
  private optionalDevices?: { root: OptionalDevices };
  private optionalDeviceSlots?: { root: OptionalDeviceSlots };
  private tankmenAvatar?: { root: TankmenAvatar };
  private mapsYaml?: MapsYaml;
  private camouflagesXml?: { root: CamouflagesXml };
  private camouflagesYaml?: CamouflagesYaml;
  private squadBattleTypeStyles?: SquadBattleTypeStylesYaml;
  private gameTypeSelectorStyles?: SquadBattleTypeStylesYaml;
  private combatRoles?: CombatRolesYaml;
  private tierEqualizer?: string[][];

  constructor(vfs: AbstractVFS) {
    super();
    this.vfs = vfs;
  }

  async init() {
    this.nationsDir = await this.vfs
      .dir("Data/XML/item_defs/vehicles")
      .then((files) => files.filter((nation) => nation !== "common"));

    this.optionalDevices = await this.vfs.xml<{ root: OptionalDevices }>(
      "Data/XML/item_defs/vehicles/common/optional_devices.xml",
    );
    this.optionalDeviceSlots = await this.vfs.xml<{
      root: OptionalDeviceSlots;
    }>("Data/XML/item_defs/vehicles/common/optional_device_slots.xml");
    this.tankmenAvatar = await this.vfs.xml<{ root: TankmenAvatar }>(
      "Data/XML/item_defs/tankmen/avatar.xml",
    );
    this.mapsYaml = await this.vfs.yaml<MapsYaml>("Data/maps.yaml");
    this.camouflagesXml = await this.vfs.xml<{ root: CamouflagesXml }>(
      "Data/XML/item_defs/vehicles/common/camouflages.xml",
    );
    this.camouflagesYaml = await this.vfs.yaml<CamouflagesYaml>(
      "Data/camouflages.yaml",
    );
    this.squadBattleTypeStyles = await this.vfs.yaml<SquadBattleTypeStylesYaml>(
      `Data/UI/Screens3/Lobby/Hangar/Squad/SquadBattleType.yaml`,
    );
    this.gameTypeSelectorStyles =
      await this.vfs.yaml<SquadBattleTypeStylesYaml>(
        `Data/UI/Screens/Lobby/Hangar/GameTypeSelector.yaml`,
      );
    this.combatRoles = await this.vfs.yaml<CombatRolesYaml>(
      `Data/XML/item_defs/vehicles/common/combat_roles.yaml`,
    );
    this.tierEqualizer = await this.vfs.csv(
      `Data/XML/item_defs/vehicles/common/tier_equializer.csv`,
      { delimiter: ";" },
    );

    await Promise.all(
      locales.supported.map(async ({ locale }) => {
        const blitzLocale = SUPPORTED_LOCALE_BLITZ_MAP[locale];
        const cache = await fetch(
          `https://stufficons.wgcdn.co/localizations/${blitzLocale}.yaml`,
        )
          .then((response) => response.text())
          .then((string) => parseYaml(string) as BlitzStrings);
        const preInstalled = await this.vfs.yaml<BlitzStrings>(
          `Data/Strings/${blitzLocale}.yaml`,
        );

        this.stringsI18n[locale] = {
          ...cache,
          ...preInstalled,
        };
      }),
    );

    for (const match of (
      await this.vfs.text(
        `Data/XML/item_defs/vehicles/common/consumables/list.xml`,
      )
    ).matchAll(/<items path="(.+)\.xml"\/>/g)) {
      if (match[1] === "prototypes") continue;

      Object.assign(
        this.consumablesCommon,
        (
          await this.vfs.xml<{ root: ConsumablesCommon }>(
            `Data/XML/item_defs/vehicles/common/consumables/${match[1]}.xml`,
          )
        ).root,
      );
    }

    for (const match of (
      await this.vfs.text(
        `Data/XML/item_defs/vehicles/common/provisions/list.xml`,
      )
    ).matchAll(/<items path="(.+)\.xml"\/>/g)) {
      if (match[1] === "prototypes") continue;

      Object.assign(
        this.provisionsCommon,
        (
          await this.vfs.xml<{ root: ConsumablesCommon }>(
            `Data/XML/item_defs/vehicles/common/provisions/${match[1]}.xml`,
          )
        ).root,
      );
    }
  }

  private getString(name: string) {
    const collection: Record<string, string> = {
      [locales.default]: this.stringsI18n[locales.default][name],
    };

    for (const { locale } of locales.supported) {
      const localizedString = this.stringsI18n[locale][name];

      if (
        localizedString === undefined ||
        localizedString === collection[locales.default]
      ) {
        continue;
      }

      collection[locale] = localizedString;
    }

    return { locales: collection } satisfies I18nString;
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

  private parseResearchCost(raw: number | string) {
    if (typeof raw === "number") {
      return {
        research_cost_type: { $case: "xp", value: raw },
      } satisfies ResearchCost;
    } else {
      return {
        research_cost_type: {
          $case: "seasonal_tokens",
          value: {
            season: Number(/prx_season_(\d+):\d+/.exec(raw)![1]),
            tokens: Number(/prx_season_\d+:(\d+)/.exec(raw)![1]),
          },
        },
      } satisfies ResearchCost;
    }
  }

  async tankDefinitions() {
    const tankDefinitions = TankDefinitions.create();

    const gameModeNativeNames: Record<string, number> = {};
    const squadBattleTypeGameModeNativeNameMatches =
      this.squadBattleTypeStyles!.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
        /"(\d+)" -> "(battleType\/([a-zA-Z]+))"/g,
      );
    const gameTypeGameModeNativeNameMatches =
      this.gameTypeSelectorStyles!.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
        /eGameMode\.([a-zA-Z]+) -> "~res:\/Gfx\/UI\/Hangar\/GameTypes\/battle-type_([^"]+)"/g,
      );

    for (const match of squadBattleTypeGameModeNativeNameMatches) {
      const id = Number(match[1]);
      gameModeNativeNames[match[3]] = id;
    }

    for (const match of gameTypeGameModeNativeNameMatches) {
      Object.entries(gameModeNativeNames).forEach(([key, value]) => {
        if (key.toLowerCase() === match[2].toLowerCase()) {
          gameModeNativeNames[match[1]] = value;
        }
      });
    }

    const botPattern = /^.+((tutorial_bot(\d+)?)|(TU))$/;
    const slugRequesters = new Map<string, { id: number; key: string }[]>();
    const idToNation: Record<number, string> = {};

    for (const nation of this.nationsDir!) {
      const tankList = await this.vfs.xml<{ root: VehicleDefinitionList }>(
        `Data/XML/item_defs/vehicles/${nation}/list.xml`,
      );

      for (const tankKey in tankList.root) {
        if (botPattern.test(tankKey)) continue;

        const tank = tankList.root[tankKey];
        const tankId = toUniqueId(nation, tank.id);

        const name = (
          (tank.shortUserString
            ? this.getString(tank.shortUserString)
            : undefined) ?? this.getString(tank.userString)
        ).locales.en;

        let slug = sluggify(name);

        idToNation[tankId] = nation;

        if (slugRequesters.has(slug)) {
          slugRequesters.get(slug)!.push({ id: tankId, key: tankKey });
        } else {
          slugRequesters.set(slug, [{ id: tankId, key: tankKey }]);
        }
      }
    }

    const slugs = new Map<number, string>();

    slugRequesters.forEach((requesters, slug) => {
      if (requesters.length === 1) {
        slugs.set(requesters[0].id, slug);
        return;
      }

      console.warn(
        `Multiple tanks share slug ${slug}: ${requesters
          .map(({ key }) => key)
          .join(", ")}`,
      );

      if (requesters.length !== 2) {
        throw new Error("Unresolvable number of duplicates :(");
      }

      const nonCanonical = requesters.find(({ key }) => key.endsWith("TUR"));

      if (nonCanonical === undefined) {
        console.log("Using nations to discriminate");
        // both are non-tutorial tanks, will have to discriminate using nation

        requesters.forEach(({ id, key }) => {
          const nation = idToNation[id];
          const discriminator =
            this.nationSlugDiscriminators[
              nation as keyof typeof this.nationSlugDiscriminators
            ];

          console.log(`Solution: ${key} -> ${slug}-${discriminator}`);
          slugs.set(id, `${slug}-${discriminator}`);
        });
      } else {
        console.log("Using tutorial bot suffix to discriminate");

        const canonical = requesters.find(({ key }) => !key.endsWith("TUR"));

        if (canonical === undefined) {
          throw new Error(
            "Two tutorial bots share the same slug? The world is truly broken.",
          );
        }

        console.log(`Solution: ${canonical.key} -> ${slug}`);
        slugs.set(canonical.id, slug);
        console.log(`Solution: ${nonCanonical.key} -> ${slug}-tur`);
        slugs.set(nonCanonical.id, `${slug}-tur`);
      }
    });

    const tankXps = new Map<number, ResearchCost>();

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
      const shellList = await this.vfs.xml<{
        root: ShellDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/shells.xml`);
      const enginesList = await this.vfs.xml<{
        root: EngineDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/engines.xml`);
      const chassisList = await this.vfs.xml<{
        root: ChassisDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/chassis.xml`);

      function resolveUnlocks(
        blitzModuleTypeToBlitzkit: Record<keyof BlitzModuleType, ModuleType>,
        unlocks?: BlitzModuleType,
      ) {
        if (!unlocks) return [];

        return Object.entries(unlocks)
          .map(([type, list]) =>
            (Array.isArray(list) ? list : [list]).map((item) => {
              const typeTyped = type as keyof BlitzModuleType;
              let rawId: number;

              if (typeTyped === "chassis") {
                rawId = chassisList.root.ids[item["#text"]];
              } else if (typeTyped === "engine") {
                rawId = enginesList.root.ids[item["#text"]];
              } else if (typeTyped === "gun") {
                rawId = gunList.root.ids[item["#text"]];
              } else if (typeTyped === "turret") {
                rawId = turretList.root.ids[item["#text"]];
              } else if (typeTyped === "vehicle") {
                rawId = tankList.root[item["#text"]].id;
              }

              return {
                id: toUniqueId(nation, rawId!),
                type: blitzModuleTypeToBlitzkit[typeTyped],
                cost: {
                  type:
                    typeof item.cost === "number"
                      ? "xp"
                      : item.cost.split(":")[0],
                  value:
                    typeof item.cost === "number"
                      ? item.cost
                      : Number(item.cost.split(":")[1]),
                },
              } satisfies Unlock;
            }),
          )
          .flat();
      }

      for (const tankKey in tankList.root) {
        if (botPattern.test(tankKey)) continue;

        const gunXps = new Map<number, ResearchCost>();
        const turretXps = new Map<number, ResearchCost>();
        const engineXps = new Map<number, ResearchCost>();
        const trackXps = new Map<number, ResearchCost>();
        const tank = tankList.root[tankKey];
        let tankPrice: TankPrice;
        const tankDefinition = await this.vfs.xml<{ root: VehicleDefinitions }>(
          `Data/XML/item_defs/vehicles/${nation}/${tankKey}.xml`,
        );
        const tankParameters = await this.vfs.yaml<TankParameters>(
          `Data/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`,
        );
        const tankId = toUniqueId(nation, tank.id);

        const tankTags = tank.tags.split(" ");
        const hullArmor: Armor = { spaced: [], thickness: {} };
        const equipment = tankDefinition.root.optDevicePreset;
        this.tankStringIdMap[`${nation}:${tankKey}`] = tankId;
        const slug = slugs.get(tankId);

        if (slug === undefined) {
          throw new Error(
            `Could not find slug for ${nation}/${tankKey} (${tankId})`,
          );
        }

        if (tank.sellPrice) {
          tankPrice = {
            type: TankPriceType.TANK_PRICE_TYPE_GOLD,
            value: tank.sellPrice["#text"] * 2,
          };
        } else if (typeof tank.price === "number") {
          tankPrice = {
            type: TankPriceType.TANK_PRICE_TYPE_CREDITS,
            value: tank.price,
          };
        } else {
          tankPrice = {
            type: TankPriceType.TANK_PRICE_TYPE_CREDITS,
            value: tank.price["#text"] * 400,
          };
        }

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
        const fixedCamouflage = tankTags.includes("eventCamouflage_user");
        const totalUnlocks: UnlocksListing[] = [];

        for (const crewKey in tankDefinition.root.crew) {
          const value = tankDefinition.root.crew[crewKey as BlitzCrewType];

          {
            let entry: Crew;
            const index = crew.findIndex(
              ({ type }) => this.blitzkitCrewTypeToBlitz[type] === crewKey,
            );
            if (index === -1) {
              if (crewKey === "#text") return;
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
        }

        const camouflages = Object.entries(
          this.camouflagesXml!.root.camouflages,
        )
          .filter(([, camo]) => {
            if (!camo.vehicleFilter.include) return false;
            if (camo.unlockCostCategory !== "legendary-skins-gold")
              return false;

            const includeArray = Array.isArray(camo.vehicleFilter.include)
              ? camo.vehicleFilter.include
              : [camo.vehicleFilter.include];

            return includeArray.some((filter) => {
              if ("vehicle" in filter && filter.vehicle?.name) {
                return filter.vehicle.name === `${nation}:${tankKey}`;
              }

              return false;
            });
          })
          .map(([, camo]) => camo.id);

        let equalizerEntry = this.tierEqualizer!.find(
          (line) => line[0] === `${nation}:${tankKey}`,
        );

        let equalizer: Equalizer | undefined;

        if (equalizerEntry) {
          const [health, penetration, module_health, damage, armor] =
            equalizerEntry?.slice(1).map(Number);
          equalizer = { health, penetration, module_health, damage, armor };
        }

        tankDefinitions.tanks[tankId] = {
          ancestors: [],
          successors: [],
          id: tankId,
          dev_name: tankKey,
          roles: {},
          camouflages: camouflages,
          fixed_camouflage: fixedCamouflage,
          crew,
          weight: tankDefinition.root.hull.weight,
          health: tankDefinition.root.hull.maxHealth,
          speed_forwards: tankDefinition.root.speedLimits.forward,
          speed_backwards: tankDefinition.root.speedLimits.backward,
          equipment_preset:
            typeof equipment === "string" ? equipment : equipment.at(-1)!,
          max_consumables: tankDefinition.root.consumableSlots,
          max_provisions: tankDefinition.root.provisionSlots,
          name:
            (tank.shortUserString
              ? this.getString(tank.shortUserString)
              : undefined) ?? this.getString(tank.userString),
          slug,
          nation,
          type: tankTags.includes("collectible")
            ? TankType.TANK_TYPE_COLLECTOR
            : (typeof tank.price === "number" ? false : "gold" in tank.price)
              ? TankType.TANK_TYPE_PREMIUM
              : TankType.TANK_TYPE_RESEARCHABLE,
          tier: tank.level,
          class: this.blitzTankClassToBlitzkit[tankTags[0] as BlitzTankClass],
          testing: tankTags.includes("testTank"),
          deprecated: tankTags.includes("deprecated"),
          price: tankPrice,
          camouflage_still: tankDefinition.root.invisibility.still,
          camouflage_moving: tankDefinition.root.invisibility.moving,
          camouflage_on_fire: tankDefinition.root.invisibility.firePenalty,
          turrets: [],
          engines: [],
          tracks: [],
          equalizer,
        };

        if (tank.combatRole) {
          Object.entries(tank.combatRole).forEach(([gameMode, role]) => {
            const id = Object.entries(gameModeNativeNames).find(
              ([key]) => key.toLowerCase() === gameMode.toLowerCase(),
            )?.[1];

            if (id === undefined) {
              throw new Error(
                `Unknown game mode in tank ${tankKey}: ${gameMode}`,
              );
            }

            tankDefinitions.tanks[tankId].roles[id] =
              this.combatRoles![role].id;
          });
        }

        Object.keys(tankDefinition.root.chassis).forEach((key) => {
          const track = tankDefinition.root.chassis[key];
          const trackId = toUniqueId(nation, chassisList.root.ids[key]);
          const terrainResistances = track.terrainResistance
            .split(" ")
            .map(Number);

          totalUnlocks.push(track.unlocks);
          tankDefinitions.tanks[tankId].tracks.push({
            id: trackId,
            weight: track.weight,
            name: this.getString(track.userString),
            traverse_speed: track.rotationSpeed,
            dispersion_move: track.shotDispersionFactors.vehicleMovement,
            dispersion_traverse: track.shotDispersionFactors.vehicleRotation,
            resistance_hard: terrainResistances[0],
            resistance_medium: terrainResistances[1],
            resistance_soft: terrainResistances[2],
            tier: track.level,
            unlocks: resolveUnlocks(
              this.blitzModuleTypeToBlitzkit,
              track.unlocks,
            ),
          });
        });

        Object.keys(tankDefinition.root.engines).forEach((engineKey) => {
          const engine = tankDefinition.root.engines[engineKey];
          const engineListEntry = enginesList.root.shared[engineKey];
          const engineId = toUniqueId(nation, enginesList.root.ids[engineKey]);

          totalUnlocks.push(engine.unlocks);
          tankDefinitions.tanks[tankId].engines.push({
            id: engineId,
            name: this.getString(engineListEntry.userString),
            fire_chance: engineListEntry.fireStartingChance,
            tier: engineListEntry.level,
            weight: engineListEntry.weight,
            power: engineListEntry.power,
            unlocks: resolveUnlocks(
              this.blitzModuleTypeToBlitzkit,
              engine.unlocks,
            ),
          });
        });

        let turretIndex = 0;
        for (const turretKey in tankDefinition.root.turrets0) {
          {
            const turret = tankDefinition.root.turrets0[turretKey];
            const turretId = toUniqueId(nation, turretList.root.ids[turretKey]);

            const turretArmor: Armor = { thickness: {}, spaced: [] };

            totalUnlocks.push(turret.unlocks);
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

            tankDefinitions.tanks[tankId].turrets.push({
              id: turretId,
              traverse_speed: turret.rotationSpeed,
              name: this.getString(turret.userString),
              tier: turret.level,
              guns: [],
              health: turret.maxHealth,
              view_range: turret.circularVisionRadius,
              weight: turret.weight,
              unlocks: resolveUnlocks(
                this.blitzModuleTypeToBlitzkit,
                turret.unlocks,
              ),
            });

            let gunIndex = 0;
            for (const gunKey in turret.guns) {
              {
                const gun = turret.guns[gunKey];
                const gunId = toUniqueId(nation, gunList.root.ids[gunKey]);
                const gunListEntry = gunList.root.shared[gunKey];
                const pitchLimitsRaw =
                  gun.pitchLimits ?? gunListEntry.pitchLimits;
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
                const gunName = this.getString(gunListEntry.userString);
                const gunType =
                  "clip" in gun
                    ? gun.pumpGunMode
                      ? "autoReloader"
                      : "autoLoader"
                    : "regular";
                // const gunReload = gun.reloadTime;
                // const shellReloads =
                const gunClipCount =
                  gunType === "regular" ? 1 : gun.clip!.count;
                const gunArmor: Armor = { thickness: {}, spaced: [] };
                const shotDispersionFactors =
                  gun.shotDispersionFactors ??
                  gunListEntry.shotDispersionFactors;
                const maskName = `gun_${gunModel.toString().padStart(2, "0")}`;
                const maskEnabled =
                  tankParameters.maskSlice?.[maskName]?.enabled ?? false;
                let assault_ranges: AssaultRanges | undefined;

                if (gun.extras?.trayShell) {
                  const types = gun.extras.trayShell.kinds
                    .split(" ")
                    .map((string) => {
                      const trimmed = string.trim();

                      if (trimmed in this.blitzShellKindToBlitzkit) {
                        return this.blitzShellKindToBlitzkit[
                          trimmed as ShellKind
                        ];
                      }

                      throw new SyntaxError(`Invalid shell kind: ${trimmed}`);
                    });
                  const sectorNames = Object.keys(gun.extras.trayShell.sectors);

                  if (sectorNames.length !== 1 || sectorNames[0] !== "sector") {
                    throw new SyntaxError("Invalid tray shell sector");
                  }

                  const sector = gun.extras.trayShell.sectors.sector;

                  assault_ranges = {
                    types,
                    ranges: sector.map((value) => ({
                      factor: value.factor,
                      distance: value.distance,
                    })),
                  };
                }

                totalUnlocks.push(gun.unlocks);
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

                tankDefinitions.tanks[tankId].turrets[turretIndex].guns.push({
                  id: gunId,
                  weight: gunListEntry.weight,
                  rotation_speed: gunListEntry.rotationSpeed,
                  name: gunName,
                  tier: gunListEntry.level,
                  shells: [],
                  camouflage_loss:
                    typeof gun.invisibilityFactorAtShot === "number"
                      ? gun.invisibilityFactorAtShot
                      : gun.invisibilityFactorAtShot.at(-1)!,
                  aim_time: gun.aimingTime ?? gunListEntry.aimingTime,
                  dispersion_base:
                    gun.shotDispersionRadius ??
                    gunListEntry.shotDispersionRadius,
                  dispersion_damaged: shotDispersionFactors.whileGunDamaged,
                  dispersion_shot: shotDispersionFactors.afterShot,
                  dispersion_traverse: shotDispersionFactors.turretRotation,
                  unlocks: resolveUnlocks(
                    this.blitzModuleTypeToBlitzkit,
                    gun.unlocks,
                  ),
                  shell_capacity: gun.maxAmmo ?? gunListEntry.maxAmmo,
                  assault_ranges,
                  burst:
                    gun.burst && gun.burst.count > 1
                      ? {
                          count: gun.burst.count,
                          interval: 60 / gun.burst.rate,
                        }
                      : undefined,
                  gun_type:
                    gunType === "regular"
                      ? {
                          $case: "regular",
                          value: {
                            reload: gun.reloadTime,
                          },
                        }
                      : gunType === "autoReloader"
                        ? {
                            $case: "auto_reloader",
                            value: {
                              intra_clip: 60 / gun.clip!.rate,
                              shell_count: gunClipCount,
                              shell_reloads: gun
                                .pumpGunReloadTimes!.split(" ")
                                .map(Number),
                            },
                          }
                        : {
                            $case: "auto_loader",
                            value: {
                              intra_clip: 60 / gun.clip!.rate,
                              clip_reload: gun.reloadTime,
                              shell_count: gunClipCount,
                            },
                          },
                } satisfies GunDefinition);

                for (const shellKey in gunListEntry.shots) {
                  {
                    const gunShellEntry = gunListEntry.shots[shellKey];
                    const shell = shellList.root[shellKey];
                    const shellId = toUniqueId(nation, shell.id);
                    const shellName = this.getString(shell.userString);
                    const penetrationRaw = gunShellEntry.piercingPower
                      .split(" ")
                      .filter((penetrationString) => penetrationString !== "")
                      .map(Number);

                    tankDefinitions.tanks[tankId].turrets[turretIndex].guns[
                      gunIndex
                    ].shells.push({
                      id: shellId,
                      name: shellName,
                      velocity: gunShellEntry.speed,
                      armor_damage: shell.damage.armor,
                      module_damage: shell.damage.devices,
                      caliber: shell.caliber,
                      normalization: shell.normalizationAngle,
                      ricochet: shell.ricochetAngle,
                      type: this.blitzShellKindToBlitzkit[shell.kind],
                      explosion_radius:
                        shell.kind === "HIGH_EXPLOSIVE"
                          ? (shell.explosionRadius ?? 0)
                          : undefined,
                      icon: shell.icon,
                      penetration: {
                        near: penetrationRaw[0],
                        far: penetrationRaw[1],
                      },
                      range: gunShellEntry.maxDistance,
                    });
                  }
                }
              }

              gunIndex++;
            }
          }

          turretIndex++;
        }

        for (const unlocks of totalUnlocks) {
          if (unlocks === undefined) return;

          for (const key in unlocks) {
            const value = unlocks[key as keyof BlitzModuleType];

            for (const vehicle of Array.isArray(value) ? value : [value]) {
              switch (key as keyof BlitzModuleType) {
                case "vehicle": {
                  const tankListEntry = tankList.root[vehicle["#text"]];
                  const currentTank = tankDefinitions.tanks[tankId];
                  const successorId = toUniqueId(nation, tankListEntry.id);

                  tankXps.set(
                    successorId,
                    this.parseResearchCost(vehicle.cost),
                  );

                  if (currentTank.successors === undefined) {
                    currentTank.successors = [];
                  }
                  if (!currentTank.successors!.includes(successorId)) {
                    currentTank.successors!.push(successorId);
                  }
                  break;
                }

                case "gun": {
                  gunXps.set(
                    toUniqueId(nation, gunList.root.ids[vehicle["#text"]]),
                    this.parseResearchCost(vehicle.cost),
                  );
                  break;
                }

                case "turret": {
                  turretXps.set(
                    toUniqueId(nation, turretList.root.ids[vehicle["#text"]]),
                    this.parseResearchCost(vehicle.cost),
                  );
                  break;
                }

                case "engine": {
                  engineXps.set(
                    toUniqueId(nation, enginesList.root.ids[vehicle["#text"]]),
                    this.parseResearchCost(vehicle.cost),
                  );
                  break;
                }

                case "chassis": {
                  trackXps.set(
                    toUniqueId(nation, chassisList.root.ids[vehicle["#text"]]),
                    this.parseResearchCost(vehicle.cost),
                  );
                  break;
                }
              }
            }
          }
        }

        Object.values(tankDefinitions.tanks[tankId].turrets).forEach(
          (turret) => {
            turret.research_cost = turretXps.get(turret.id);

            Object.values(turret.guns).forEach((gunRaw) => {
              gunRaw.research_cost = gunXps.get(gunRaw.id);
            });
          },
        );

        Object.values(tankDefinitions.tanks[tankId].engines).forEach(
          (engine) => {
            engine.research_cost = engineXps.get(engine.id);
          },
        );

        Object.values(tankDefinitions.tanks[tankId].tracks).forEach((track) => {
          track.research_cost = trackXps.get(track.id);
        });
      }
    }

    return tankDefinitions;
  }

  async camouflageDefinitions() {
    const camouflageDefinitions = CamouflageDefinitions.create();

    for (const camoKey in this.camouflagesXml!.root.camouflages) {
      const camo = this.camouflagesXml!.root.camouflages[camoKey];

      const yamlEntry = this.camouflagesYaml![camoKey];
      const fullName = yamlEntry.userString
        ? this.getString(yamlEntry.userString)
        : undefined;
      const shortName = yamlEntry.shortUserString
        ? this.getString(yamlEntry.shortUserString)
        : undefined;
      const resolvedTankName = shortName ?? fullName;
      const resolvedTankNameFull =
        resolvedTankName === fullName ? undefined : fullName;

      camouflageDefinitions.camouflages[camo.id] = {
        id: camo.id,
        name: this.getString(camo.userString),
        tank_name: resolvedTankName,
        tank_name_full: resolvedTankNameFull,
      };
    }

    return camouflageDefinitions;
  }

  async modelDefinitions() {
    const modelDefinitions = ModelDefinitions.create();

    for (const nation of this.nationsDir!) {
      const tankList = await vfs.xml<{ root: VehicleDefinitionList }>(
        `Data/XML/item_defs/vehicles/${nation}/list.xml`,
      );
      const turretList = await vfs.xml<{
        root: TurretDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/turrets.xml`);
      const gunList = await vfs.xml<{
        root: GunDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/guns.xml`);
      const shellList = await vfs.xml<{
        root: ShellDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/shells.xml`);
      const enginesList = await vfs.xml<{
        root: EngineDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/engines.xml`);
      const chassisList = await vfs.xml<{
        root: ChassisDefinitionsList;
      }>(`Data/XML/item_defs/vehicles/${nation}/components/chassis.xml`);

      for (const tankKey in tankList.root) {
        if (botPattern.test(tankKey)) continue;

        const gunXps = new Map<number, ResearchCost>();
        const turretXps = new Map<number, ResearchCost>();
        const engineXps = new Map<number, ResearchCost>();
        const trackXps = new Map<number, ResearchCost>();
        const tank = tankList.root[tankKey];
        const tankDefinition = await vfs.xml<{ root: VehicleDefinitions }>(
          `Data/XML/item_defs/vehicles/${nation}/${tankKey}.xml`,
        );
        const tankParameters = await vfs.yaml<TankParameters>(
          `Data/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`,
        );
        const turretOrigin = tankDefinition.root.hull.turretPositions.turret
          .split(" ")
          .map(Number) as Vector3Tuple;
        const tankId = toUniqueId(nation, tank.id);

        const tankTags = tank.tags.split(" ");
        const hullArmor: Armor = { spaced: [], thickness: {} };
        tankStringIdMap[`${nation}:${tankKey}`] = tankId;
        const slug = slugs.get(tankId);

        if (slug === undefined) {
          throw new Error(
            `Could not find slug for ${nation}/${tankKey} (${tankId})`,
          );
        }

        if (tank.sellPrice) {
          tankPrice = {
            type: TankPriceType.TANK_PRICE_TYPE_GOLD,
            value: tank.sellPrice["#text"] * 2,
          };
        } else if (typeof tank.price === "number") {
          tankPrice = {
            type: TankPriceType.TANK_PRICE_TYPE_CREDITS,
            value: tank.price,
          };
        } else {
          tankPrice = {
            type: TankPriceType.TANK_PRICE_TYPE_CREDITS,
            value: tank.price["#text"] * 400,
          };
        }

        Object.keys(tankDefinition.root.hull.armor)
          .filter((name) => name.startsWith("armor_"))
          .forEach((name) => {
            const armorIdString = name.match(/armor_(\d+)/)?.[1];

            if (armorIdString === undefined) {
              throw new SyntaxError(`Invalid armor id: ${name}`);
            }

            const armorId = parseInt(armorIdString);
            const armorRaw = tankDefinition.root.hull.armor[name];

            assignArmor(armorRaw, armorId, hullArmor);
          });
        const crew: Crew[] = [];
        const totalUnlocks: UnlocksListing[] = [];

        Object.entries(tankDefinition.root.crew).forEach(([crewKey, value]) => {
          let entry: Crew;
          const index = crew.findIndex(
            ({ type }) => blitzkitCrewTypeToBlitz[type] === crewKey,
          );
          if (index === -1) {
            if (crewKey === "#text") return;
            entry = {
              type: blitzCrewTypeToBlitzkit[crewKey as BlitzCrewType],
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
                return blitzCrewTypeToBlitzkit[member.trim() as BlitzCrewType];
              });
            }
          } else {
            if (entry.count === undefined) {
              entry.count = value.length;
            } else {
              entry.count += value.length;
            }
          }
        });

        let equalizerEntry = tierEqualizer.find(
          (line) => line[0] === `${nation}:${tankKey}`,
        );

        if (equalizerEntry) {
          const [health, penetration, module_health, damage, armor] =
            equalizerEntry?.slice(1).map(Number);
          equalizer = { health, penetration, module_health, damage, armor };
        }

        if (tank.combatRole) {
          Object.entries(tank.combatRole).forEach(([gameMode, role]) => {
            const id = Object.entries(gameModeNativeNames).find(
              ([key]) => key.toLowerCase() === gameMode.toLowerCase(),
            )?.[1];

            if (id === undefined) {
              throw new Error(
                `Unknown game mode in tank ${tankKey}: ${gameMode}`,
              );
            }
          });
        }

        modelDefinitions.models[tankId] = {
          armor: hullArmor,
          turret_origin: vector3TupleToBlitzkit(turretOrigin),
          initial_turret_rotation: tankDefinition.root.hull
            .turretInitialRotation
            ? {
                yaw: tankDefinition.root.hull.turretInitialRotation.yaw,
                pitch: tankDefinition.root.hull.turretInitialRotation.pitch,
                roll: tankDefinition.root.hull.turretInitialRotation.roll,
              }
            : undefined,
          bounding_box: {
            min: vector3TupleToBlitzkit(tankParameters.collision.hull.bbox.min),
            max: vector3TupleToBlitzkit(tankParameters.collision.hull.bbox.max),
          },
          turrets: {},
          tracks: {},
        };

        Object.keys(tankDefinition.root.chassis).forEach((key) => {
          const track = tankDefinition.root.chassis[key];
          const trackId = toUniqueId(nation, chassisList.root.ids[key]);
          const trackArmorRaw = track.armor.leftTrack;
          const hullOrigin = track.hullPosition
            .split(" ")
            .map(Number) as Vector3Tuple;

          totalUnlocks.push(track.unlocks);

          modelDefinitions.models[tankId].tracks[trackId] = {
            thickness:
              typeof trackArmorRaw === "number"
                ? trackArmorRaw
                : trackArmorRaw["#text"],
            origin: vector3TupleToBlitzkit(hullOrigin),
          };
        });

        Object.keys(tankDefinition.root.engines).forEach((engineKey) => {
          const engine = tankDefinition.root.engines[engineKey];

          totalUnlocks.push(engine.unlocks);
        });

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

          totalUnlocks.push(turret.unlocks);
          Object.keys(turret.armor)
            .filter((name) => name.startsWith("armor_"))
            .forEach((name) => {
              const armorIdString = name.match(/armor_(\d+)/)?.[1];

              if (armorIdString === undefined) {
                throw new SyntaxError(`Invalid armor id: ${name}`);
              }

              const armorId = parseInt(armorIdString);
              const armorRaw = turret.armor[name];

              assignArmor(armorRaw, armorId, turretArmor);
            });

          turret.userString;

          modelDefinitions.models[tankId].turrets[turretId] = {
            armor: turretArmor,
            gun_origin: vector3TupleToBlitzkit(gunOrigin),
            model_id: turretModel,
            yaw:
              -turretYaw[0] + turretYaw[1] === 360
                ? undefined
                : { min: turretYaw[0], max: turretYaw[1] },
            guns: {},
            bounding_box: {
              min: vector3TupleToBlitzkit(
                tankParameters.collision[
                  parsePath(turret.hitTester.collisionModel).name.toLowerCase()
                ].bbox.min,
              ),
              max: vector3TupleToBlitzkit(
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
            // const gunReload = gun.reloadTime;
            // const shellReloads =
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

            if (gun.extras?.trayShell) {
              const types = gun.extras.trayShell.kinds
                .split(" ")
                .map((string) => {
                  const trimmed = string.trim();

                  if (trimmed in blitzShellKindToBlitzkit) {
                    return blitzShellKindToBlitzkit[trimmed as ShellKind];
                  }

                  throw new SyntaxError(`Invalid shell kind: ${trimmed}`);
                });
              const sectorNames = Object.keys(gun.extras.trayShell.sectors);

              if (sectorNames.length !== 1 || sectorNames[0] !== "sector") {
                throw new SyntaxError("Invalid tray shell sector");
              }

              const sector = gun.extras.trayShell.sectors.sector;

              assault_ranges = {
                types,
                ranges: sector.map((value) => ({
                  factor: value.factor,
                  distance: value.distance,
                })),
              };
            }

            if (maskEnabled) {
              const maskRaw = tankParameters.maskSlice![maskName]!;
              mask = maskRaw.planePosition[1];
            } else {
              mask = undefined;
            }

            totalUnlocks.push(gun.unlocks);
            Object.keys(gun.armor)
              .filter((name) => name.startsWith("armor_"))
              .forEach((name) => {
                const armorIdString = name.match(/armor_(\d+)/)?.[1];
                if (armorIdString === undefined) {
                  throw new SyntaxError(`Invalid armor id: ${name}`);
                }
                const armorId = parseInt(armorIdString);
                const armorRaw = gun.armor[name];

                assignArmor(armorRaw, armorId, gunArmor);
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

        totalUnlocks.forEach((unlocks) => {
          if (unlocks === undefined) return;

          Object.entries(unlocks).forEach(([key, value]) => {
            (Array.isArray(value) ? value : [value]).forEach((vehicle) => {
              switch (key as keyof BlitzModuleType) {
                case "vehicle": {
                  const tankListEntry = tankList.root[vehicle["#text"]];
                  const successorId = toUniqueId(nation, tankListEntry.id);

                  tankXps.set(successorId, parseResearchCost(vehicle.cost));

                  if (currentTank.successors === undefined) {
                    currentTank.successors = [];
                  }
                  if (!currentTank.successors!.includes(successorId)) {
                    currentTank.successors!.push(successorId);
                  }
                  break;
                }

                case "gun": {
                  gunXps.set(
                    toUniqueId(nation, gunList.root.ids[vehicle["#text"]]),
                    parseResearchCost(vehicle.cost),
                  );
                  break;
                }

                case "turret": {
                  turretXps.set(
                    toUniqueId(nation, turretList.root.ids[vehicle["#text"]]),
                    parseResearchCost(vehicle.cost),
                  );
                  break;
                }

                case "engine": {
                  engineXps.set(
                    toUniqueId(nation, enginesList.root.ids[vehicle["#text"]]),
                    parseResearchCost(vehicle.cost),
                  );
                  break;
                }

                case "chassis": {
                  trackXps.set(
                    toUniqueId(nation, chassisList.root.ids[vehicle["#text"]]),
                    parseResearchCost(vehicle.cost),
                  );
                  break;
                }
              }
            });
          });
        });
      }
    }

    return modelDefinitions;
  }

  async mapDefinitions() {
    const mapDefinitions = MapDefinitions.create();

    return mapDefinitions;
  }

  async equipmentDefinitions() {
    const equipmentDefinitions = EquipmentDefinitions.create();

    return equipmentDefinitions;
  }

  async consumableDefinitions() {
    const consumableDefinitions = ConsumableDefinitions.create();

    return consumableDefinitions;
  }

  async provisionDefinitions() {
    const provisionDefinitions = ProvisionDefinitions.create();

    return provisionDefinitions;
  }

  async skillDefinitions() {
    const skillDefinitions = SkillDefinitions.create();

    return skillDefinitions;
  }
}
