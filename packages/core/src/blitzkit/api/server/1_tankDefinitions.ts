import {
  AssaultRanges,
  BlitzCrewType,
  BlitzModuleType,
  BlitzTankClass,
  ChassisDefinitionsList,
  Crew,
  EngineDefinitionsList,
  Equalizer,
  GunDefinition,
  GunDefinitionsList,
  ModuleType,
  ResearchCost,
  ShellDefinitionsList,
  ShellKind,
  sluggify,
  TankDefinitions,
  TankPrice,
  TankPriceType,
  TankType,
  toUniqueId,
  TurretDefinitionsList,
  Unlock,
  UnlocksListing,
  VehicleDefinitionList,
  VehicleDefinitions,
} from "@blitzkit/core";
import { Cache, ServerBlitzKitAPI0 } from "./0_base";

export abstract class ServerBlitzKitAPI1 extends ServerBlitzKitAPI0 {
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

  @Cache()
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

    const slugRequesters = new Map<string, { id: number; key: string }[]>();
    const idToNation: Record<number, string> = {};

    for (const nation of this.nationsDir!) {
      const tankList = await this.vfs.xml<{ root: VehicleDefinitionList }>(
        `Data/XML/item_defs/vehicles/${nation}/list.xml`,
      );

      for (const tankKey in tankList.root) {
        if (this.botPattern.test(tankKey)) continue;

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
        if (this.botPattern.test(tankKey)) continue;

        const gunXps = new Map<number, ResearchCost>();
        const turretXps = new Map<number, ResearchCost>();
        const engineXps = new Map<number, ResearchCost>();
        const trackXps = new Map<number, ResearchCost>();
        const tank = tankList.root[tankKey];
        let tankPrice: TankPrice;
        const tankDefinition = await this.vfs.xml<{ root: VehicleDefinitions }>(
          `Data/XML/item_defs/vehicles/${nation}/${tankKey}.xml`,
        );
        const tankId = toUniqueId(nation, tank.id);

        const tankTags = tank.tags.split(" ");
        const equipment = tankDefinition.root.optDevicePreset;

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

        const crew: Crew[] = [];
        const fixedCamouflage = tankTags.includes("eventCamouflage_user");
        const totalUnlocks: UnlocksListing[] = [];

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

        const blitzTankClass = tankTags.find(
          (tag) => tag in this.blitzTankClassToBlitzkit,
        );

        if (blitzTankClass === undefined) {
          throw new Error(`Unknown tank class for ${nation}:${tankKey}`);
        }

        const tankClass =
          this.blitzTankClassToBlitzkit[blitzTankClass as BlitzTankClass];

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
          class: tankClass,
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
          const turret = tankDefinition.root.turrets0[turretKey];
          const turretId = toUniqueId(nation, turretList.root.ids[turretKey]);

          totalUnlocks.push(turret.unlocks);

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
            const gun = turret.guns[gunKey];
            const gunId = toUniqueId(nation, gunList.root.ids[gunKey]);
            const gunListEntry = gunList.root.shared[gunKey];
            const gunName = this.getString(gunListEntry.userString);
            const gunType =
              "clip" in gun
                ? gun.pumpGunMode
                  ? "autoReloader"
                  : "autoLoader"
                : "regular";
            const gunClipCount = gunType === "regular" ? 1 : gun.clip!.count;
            const shotDispersionFactors =
              gun.shotDispersionFactors ?? gunListEntry.shotDispersionFactors;
            let assault_ranges: AssaultRanges | undefined;

            if (gun.extras?.trayShell) {
              const types = gun.extras.trayShell.kinds
                .split(" ")
                .map((string) => {
                  const trimmed = string.trim();

                  if (trimmed in this.blitzShellKindToBlitzkit) {
                    return this.blitzShellKindToBlitzkit[trimmed as ShellKind];
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
                gun.shotDispersionRadius ?? gunListEntry.shotDispersionRadius,
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

            gunIndex++;
          }

          turretIndex++;
        }

        for (const unlocks of totalUnlocks) {
          if (unlocks === undefined) continue;

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

    Object.values(tankDefinitions.tanks).forEach((tank) => {
      tank.research_cost = tankXps.get(tank.id);
    });

    Object.values(tankDefinitions.tanks).forEach((tank) => {
      tank.successors?.forEach((predecessorId) => {
        if (
          !tankDefinitions.tanks[predecessorId].ancestors?.includes(tank.id)
        ) {
          tankDefinitions.tanks[predecessorId].ancestors?.push(tank.id);
        }
      });
    });

    return tankDefinitions;
  }
}
