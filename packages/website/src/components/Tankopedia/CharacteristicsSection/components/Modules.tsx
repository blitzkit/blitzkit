import {
  asset,
  EngineDefinition,
  formatCompact,
  GunDefinition,
  ModuleType,
  tankIcon,
  TIER_ROMAN_NUMERALS,
  TrackDefinition,
  TurretDefinition,
  type TankDefinition,
  type Unlock,
} from "@blitzkit/core";
import {
  Button,
  ChevronDownIcon,
  Flex,
  Heading,
  IconButton,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { awaitableTankDefinitions } from "../../../../core/awaitables/tankDefinitions";
import { useLocale } from "../../../../hooks/useLocale";
import { Duel } from "../../../../stores/duel";
import { LinkI18n } from "../../../LinkI18n";
import { ConfigurationChildWrapper } from "./ConfigurationChildWrapper";

type ModuleDefinition =
  | TurretDefinition
  | GunDefinition
  | TrackDefinition
  | EngineDefinition;

function extractModule(raw: ModuleDefinition | TankDefinition) {
  if ("gun_type" in raw) {
    return raw;
  } else
    return raw as Exclude<ModuleDefinition | TankDefinition, GunDefinition>;
}

interface ModuleWithUnlocks {
  unlocks: Unlock[];
}

const moduleTypeTypeIconName: Record<ModuleType, string> = {
  [ModuleType.MODULE_TYPE_VEHICLE]: "",
  [ModuleType.MODULE_TYPE_ENGINE]: "engine",
  [ModuleType.MODULE_TYPE_TRACKS]: "chassis",
  [ModuleType.MODULE_TYPE_TURRET]: "turret",
  [ModuleType.MODULE_TYPE_GUN]: "gun",
};

function ModuleButton({
  tier,
  selected,
  unlock,
  top,
  tooltip,
  onClick,
}: {
  unlock: Unlock;
  tier: number;
  selected: boolean;
  top: boolean;
  tooltip?: string;
  onClick: () => void;
}) {
  const isTank = unlock.type === ModuleType.MODULE_TYPE_VEHICLE;
  const { locale } = useLocale();

  const button = (
    <IconButton
      size="4"
      radius="small"
      variant={selected ? "surface" : "soft"}
      color={top ? "amber" : selected ? undefined : "gray"}
      onClick={onClick}
      style={{
        position: "relative",
        width: isTank ? 72 : undefined,
        height: isTank ? 72 : undefined,
      }}
    >
      <Text
        size="1"
        color="gray"
        style={{
          position: "absolute",
          left: isTank ? 8 : 4,
          top: isTank ? 8 : 4,
        }}
      >
        {TIER_ROMAN_NUMERALS[tier]}
      </Text>

      {unlock.cost!.value > 0 && (
        <Flex
          style={{
            position: "absolute",
            left: "50%",
            bottom: 4,
            transform: "translateX(-50%)",
          }}
          align="center"
          gap={isTank ? "1" : undefined}
        >
          <Text size="1" color="gray">
            {formatCompact(locale, unlock.cost!.value)}
          </Text>

          <img
            alt={unlock.cost!.type}
            src={asset(`icons/currencies/${unlock.cost!.type}.webp`)}
            style={{
              width: 12,
              height: 12,
              objectFit: "contain",
            }}
          />
        </Flex>
      )}

      <img
        alt={ModuleType[unlock.type]}
        src={
          isTank
            ? tankIcon(unlock.id)
            : asset(`icons/modules/${moduleTypeTypeIconName[unlock.type]}.webp`)
        }
        style={{
          width: isTank ? 64 : 32,
          height: isTank ? 64 : 32,
          objectFit: "contain",
        }}
      />
    </IconButton>
  );

  const node = isTank ? (
    <LinkI18n
      locale={locale}
      href={`/tanks/${tankDefinitions.tanks[unlock.id].slug}`}
    >
      {button}
    </LinkI18n>
  ) : (
    button
  );

  if (!tooltip) return node;

  return <Tooltip content={tooltip}>{node}</Tooltip>;
}

const tankDefinitions = await awaitableTankDefinitions;

export function Modules() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const hasUpgrades =
    tank.turrets.length > 1 ||
    tank.turrets[0].guns.length > 1 ||
    tank.engines.length > 1 ||
    tank.tracks.length > 1;
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);
  const engine = Duel.use((state) => state.protagonist.engine);
  const track = Duel.use((state) => state.protagonist.track);
  const turret0 = tank.turrets[0];
  const gun0 = turret0.guns[0];
  const engine0 = tank.engines[0];
  const track0 = tank.tracks[0];
  const topTurret = tank.turrets.at(-1)!;
  const topGun = topTurret.guns.at(-1)!;
  const topEngine = tank.engines.at(-1)!;
  const topTrack = tank.tracks.at(-1)!;
  const { strings, unwrap } = useLocale();

  function setByUnlock(unlock: Unlock) {
    Duel.mutate((draft) => {
      if (unlock.type === ModuleType.MODULE_TYPE_TURRET) {
        draft.protagonist.turret = draft.protagonist.tank.turrets.find(
          (turret) => turret.id === unlock.id,
        )!;

        // Check if current gun exists in new turret
        const gunInNewTurret = draft.protagonist.turret.guns.find(
          (gun) => gun.id === draft.protagonist.gun.id,
        );

        if (gunInNewTurret) {
          // Gun exists - get it FROM this turret
          draft.protagonist.gun = gunInNewTurret;
          draft.protagonist.shell = gunInNewTurret.shells[0];
        } else {
          // Gun doesn't exist - select top gun from new turret
          draft.protagonist.gun = draft.protagonist.turret.guns.at(-1)!;
          draft.protagonist.shell = draft.protagonist.gun.shells[0];
        }
      } else if (unlock.type === ModuleType.MODULE_TYPE_GUN) {
        const gunInTurret = draft.protagonist.turret.guns.find(
          (gun) => gun.id === unlock.id,
        );
        if (gunInTurret) {
          draft.protagonist.gun = gunInTurret;
          draft.protagonist.shell = gunInTurret.shells[0];
        } else {
          // TODO: warn somehow?
          const suitableTurret = draft.protagonist.tank.turrets.find((turret) =>
            turret.guns.some((gun) => gun.id === unlock.id),
          )!;
          const gunInSuitableTurret = suitableTurret.guns.find(
            (gun) => gun.id === unlock.id,
          )!;

          draft.protagonist.turret = suitableTurret;
          draft.protagonist.gun = gunInSuitableTurret;
          draft.protagonist.shell = gunInSuitableTurret.shells[0];
        }
      } else if (unlock.type === ModuleType.MODULE_TYPE_ENGINE) {
        draft.protagonist.engine = draft.protagonist.tank.engines.find(
          (engine) => engine.id === unlock.id,
        )!;
      } else if (unlock.type === ModuleType.MODULE_TYPE_TRACKS) {
        draft.protagonist.track = draft.protagonist.tank.tracks.find(
          (track) => track.id === unlock.id,
        )!;
      }
    });
  }

  function tree(type: ModuleType, unlocks: Unlock[]) {
    return (
      <Flex gap="2">
        {unlocks.map((unlock, index) => {
          const first = index === 0;
          const last = index === unlocks.length - 1;
          const central = !first && !last;
          let module: ModuleDefinition | TankDefinition | undefined = undefined;

          if (unlock.type === ModuleType.MODULE_TYPE_TRACKS) {
            module = tank.tracks.find((track) => track.id === unlock.id)!;
          } else if (unlock.type === ModuleType.MODULE_TYPE_ENGINE) {
            module = tank.engines.find((engine) => engine.id === unlock.id)!;
          } else if (unlock.type === ModuleType.MODULE_TYPE_TURRET) {
            module = tank.turrets.find((turret) => turret.id === unlock.id)!;
          } else if (unlock.type === ModuleType.MODULE_TYPE_GUN) {
            module = tank.turrets
              .find((turret) =>
                turret.guns.some((gun) => gun.id === unlock.id),
              )!
              .guns.find((gun) => gun.id === unlock.id)!;
          } else if (unlock.type === ModuleType.MODULE_TYPE_VEHICLE) {
            module = tankDefinitions.tanks[unlock.id];
          }

          if (module === undefined) return null;

          const tooltip = unwrap(module.name!);

          return (
            <Flex
              key={unlock.id}
              align="center"
              direction="column"
              gap="2"
              position="relative"
            >
              {unlock.cost!.value > 0 && (
                <>
                  {unlocks.length > 1 && (
                    <div
                      style={{
                        backgroundColor: "currentcolor",
                        width: `calc(${central ? 100 : 50}% + ${
                          central ? 8 : 4
                        }px)`,
                        height: 1,
                        position: "absolute",
                        right: first ? 0 : undefined,
                        left: last ? 0 : undefined,
                        transform: `translateX(${first ? 4 : last ? -4 : 0}px)`,
                      }}
                    />
                  )}

                  <Flex
                    direction="column"
                    align="center"
                    style={{
                      marginBottom: -7,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "currentcolor",
                        width: 1,
                        height: 8,
                      }}
                    />
                    <ChevronDownIcon
                      style={{
                        transform: "translateY(-7px)",
                      }}
                    />
                  </Flex>
                </>
              )}

              <ModuleButton
                unlock={unlock}
                tier={extractModule(module).tier}
                tooltip={tooltip}
                selected={
                  (unlock.type === ModuleType.MODULE_TYPE_TURRET
                    ? turret.id
                    : unlock.type === ModuleType.MODULE_TYPE_GUN
                      ? gun.id
                      : unlock.type === ModuleType.MODULE_TYPE_ENGINE
                        ? engine.id
                        : unlock.type === ModuleType.MODULE_TYPE_TRACKS
                          ? track.id
                          : -1) === unlock.id
                }
                top={
                  unlock.type === ModuleType.MODULE_TYPE_TURRET
                    ? extractModule(module).id == topTurret.id
                    : unlock.type === ModuleType.MODULE_TYPE_GUN
                      ? extractModule(module).id === topGun.id
                      : unlock.type === ModuleType.MODULE_TYPE_ENGINE
                        ? extractModule(module).id === topEngine.id
                        : unlock.type === ModuleType.MODULE_TYPE_TRACKS
                          ? extractModule(module).id === topTrack.id
                          : false
                }
                onClick={() => setByUnlock(unlock)}
              />

              {(extractModule(module) as ModuleWithUnlocks).unlocks &&
                (extractModule(module) as ModuleWithUnlocks).unlocks!.length >
                  1 && (
                  <div
                    style={{
                      backgroundColor: "currentcolor",
                      width: 1,
                      height: 8,
                      marginBottom: -8,
                    }}
                  />
                )}

              {(extractModule(module) as ModuleWithUnlocks).unlocks &&
                tree(
                  type,
                  (extractModule(module) as ModuleWithUnlocks).unlocks!,
                )}
            </Flex>
          );
        })}
      </Flex>
    );
  }

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Heading size="4">
          {strings.website.tools.tankopedia.configuration.modules.title}
        </Heading>

        {hasUpgrades && (
          <>
            <Button
              variant="ghost"
              color="red"
              onClick={() => {
                Duel.mutate((draft) => {
                  draft.protagonist.turret = draft.protagonist.tank.turrets[0];
                  draft.protagonist.gun = draft.protagonist.turret.guns[0];
                  draft.protagonist.shell = draft.protagonist.gun.shells[0];
                  draft.protagonist.engine = draft.protagonist.tank.engines[0];
                  draft.protagonist.track = draft.protagonist.tank.tracks[0];
                });
              }}
            >
              {strings.website.tools.tankopedia.configuration.modules.stock}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                Duel.mutate((draft) => {
                  draft.protagonist.turret =
                    draft.protagonist.tank.turrets.at(-1)!;
                  draft.protagonist.gun = draft.protagonist.turret.guns.at(-1)!;
                  draft.protagonist.shell = draft.protagonist.gun.shells[0];
                  draft.protagonist.engine =
                    draft.protagonist.tank.engines.at(-1)!;
                  draft.protagonist.track =
                    draft.protagonist.tank.tracks.at(-1)!;
                });
              }}
            >
              {strings.website.tools.tankopedia.configuration.modules.upgrade}
            </Button>
          </>
        )}
      </Flex>

      <Flex gap="2" wrap="wrap" gapY="6">
        {tree(ModuleType.MODULE_TYPE_ENGINE, [
          {
            cost: { type: "xp", value: 0 },
            id: engine0.id,
            type: ModuleType.MODULE_TYPE_ENGINE,
          },
        ])}
        {tree(ModuleType.MODULE_TYPE_TRACKS, [
          {
            cost: { type: "xp", value: 0 },
            id: track0.id,
            type: ModuleType.MODULE_TYPE_TRACKS,
          },
        ])}
        {tree(ModuleType.MODULE_TYPE_TURRET, [
          {
            cost: { type: "xp", value: 0 },
            id: turret0.id,
            type: ModuleType.MODULE_TYPE_TURRET,
          },
        ])}
        {tree(ModuleType.MODULE_TYPE_GUN, [
          {
            cost: { type: "xp", value: 0 },
            id: gun0.id,
            type: ModuleType.MODULE_TYPE_GUN,
          },
        ])}
      </Flex>
    </ConfigurationChildWrapper>
  );
}
