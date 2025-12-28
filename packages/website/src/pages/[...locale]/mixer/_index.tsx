import { asset, TIER_ROMAN_NUMERALS } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { CaretRightIcon, CaretUpIcon, UpdateIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Dialog,
  Flex,
  IconButton,
  Popover,
  Skeleton,
  Text,
  type ButtonProps,
} from "@radix-ui/themes";
import { useRef, useState } from "react";
import { MixerScene } from "../../../components/MixerScene";
import { ModuleButton } from "../../../components/ModuleButtons/ModuleButton";
import { PageWrapper } from "../../../components/PageWrapper";
import { ScreenshotButton } from "../../../components/ScreenshotButton";
import {
  TankSearch,
  type TankSearchProps,
} from "../../../components/TankSearch";
import { awaitableModelDefinitions } from "../../../core/awaitables/modelDefinitions";
import { awaitableTankDefinitions } from "../../../core/awaitables/tankDefinitions";
import { curateMixer } from "../../../core/blitzkit/curateMixer";
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from "../../../hooks/useLocale";
import { Mixer } from "../../../stores/mixer";
import { Tankopedia } from "../../../stores/tankopedia";
import type { MaybeSkeletonComponentProps } from "../../../types/maybeSkeletonComponentProps";

const modelDefinition = await awaitableModelDefinitions.then(
  ({ models }) => models[1]
);
const tankDefinitions = await awaitableTankDefinitions;

export function Page({
  locale,
  skeleton,
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  const initial = useRef(curateMixer());

  Mixer.useInitialization(initial.current);
  Tankopedia.useInitialization(modelDefinition);

  return (
    <PageWrapper color="gray" p="0" maxWidth="unset">
      <LocaleProvider locale={locale}>
        <Content skeleton={skeleton} />
      </LocaleProvider>
    </PageWrapper>
  );
}

type ModuleButtonProps = Omit<ButtonProps, "onSelect"> &
  MaybeSkeletonComponentProps & {
    tank: number;
    onSelect: TankSearchProps["onSelect"];
    turret?: number;
    gun?: number;
  };

function ModuleChooser({
  skeleton,
  tank,
  onSelect,
  turret,
  gun,
  ...props
}: ModuleButtonProps) {
  const { strings } = useLocale();
  const [open, setOpen] = useState(false);
  const tankDefinition = tankDefinitions.tanks[tank];
  const turretDefinition = tankDefinition.turrets.find((t) => t.id === turret);
  const gunDefinition = turretDefinition?.guns.find((g) => g.id === gun);
  const subSelector =
    turret !== undefined &&
    (tankDefinition.turrets.length > 1 ||
      (gun !== undefined && turretDefinition!.guns.length > 1));

  return (
    <Flex>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <Button
            variant="surface"
            size={{ initial: "3", md: "4" }}
            style={{
              overflow: "clip",
              borderTopRightRadius: subSelector ? 0 : undefined,
              borderBottomRightRadius: subSelector ? 0 : undefined,
            }}
            {...props}
          >
            {skeleton ? (
              <Skeleton width="4em" height="2em" />
            ) : (
              <img
                style={{
                  width: "4em",
                  height: "4em",
                  objectFit: "contain",
                }}
                src={asset(`icons/tanks/big/${tank}.webp`)}
              />
            )}
          </Button>
        </Dialog.Trigger>

        <Dialog.Content>
          <Dialog.Title>
            {strings.website.common.tank_search.select_dialog_title}
          </Dialog.Title>

          <TankSearch
            compact
            onSelect={(tank) => {
              onSelect?.(tank);
              setOpen(false);
            }}
          />
        </Dialog.Content>
      </Dialog.Root>

      {subSelector && (
        <Popover.Root>
          <Popover.Trigger>
            <IconButton
              variant="surface"
              size={{ initial: "3", md: "4" }}
              style={{
                overflow: "clip",
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                marginLeft: -1,
              }}
              {...props}
            >
              <CaretUpIcon />
            </IconButton>
          </Popover.Trigger>

          <Popover.Content>
            <Flex direction="column" gap="2">
              {tankDefinition.turrets.length > 1 && (
                <Flex gap="2">
                  {tankDefinition.turrets.map((turret) => (
                    <ModuleButton
                      key={turret.id}
                      module="turret"
                      discriminator={TIER_ROMAN_NUMERALS[turret.tier]}
                    />
                  ))}
                </Flex>
              )}

              {turretDefinition && turretDefinition.guns.length > 1 && (
                <Flex gap="2">
                  {turretDefinition.guns.map((gun) => (
                    <ModuleButton
                      key={gun.id}
                      module="gun"
                      discriminator={TIER_ROMAN_NUMERALS[gun.tier]}
                      secondaryDiscriminator={
                        <Text style={{ fontSize: "0.75em" }}>
                          {literals(strings.common.units.mm, {
                            value: gun.shells[0].caliber.toFixed(0),
                          })}
                        </Text>
                      }
                    />
                  ))}
                </Flex>
              )}
            </Flex>
          </Popover.Content>
        </Popover.Root>
      )}
    </Flex>
  );
}

function ModuleSeparator() {
  return (
    <Text size="5" color="gray" trim="end">
      <CaretRightIcon width="1em" height="1em" />
    </Text>
  );
}

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  const hullTankId = Mixer.use((state) => state.hull);
  const turretTankId = Mixer.use((state) => state.turret.tank.id);
  const turretTurretId = Mixer.use((state) => state.turret.turret.id);
  const gunTankId = Mixer.use((state) => state.gun.tank.id);
  const gunTurretId = Mixer.use((state) => state.gun.turret.id);
  const gunGunId = Mixer.use((state) => state.gun.gun.id);
  const canvas = useRef<HTMLCanvasElement>(null!);
  const { strings } = useLocale();

  return (
    <Box flexGrow="1" position="relative">
      <Box position="absolute" width="100%" height="100%" top="0" left="0">
        {!skeleton && <MixerScene ref={canvas} />}
      </Box>

      <Flex
        align="center"
        direction="column"
        position="absolute"
        bottom="4"
        left="50%"
        style={{ transform: "translateX(-50%)" }}
        gap="4"
      >
        <Flex gap="2">
          <ScreenshotButton
            name={hullTankId.slug}
            canvas={canvas}
            highContrast
            variant="surface"
          >
            {strings.website.tools.mixer.screenshot}
          </ScreenshotButton>
          <Button
            highContrast
            variant="surface"
            onClick={() => {
              const mixed = curateMixer();

              Mixer.mutate((draft) => {
                Object.assign(draft, mixed);
              });
            }}
          >
            <UpdateIcon />
            {strings.website.tools.mixer.randomize}
          </Button>
        </Flex>

        <Flex gap="2" align="center">
          <ModuleChooser
            skeleton={skeleton}
            tank={hullTankId.id}
            onSelect={(tank) => {
              Mixer.mutate((draft) => {
                draft.hull = tank;
              });
            }}
          />
          <ModuleSeparator />
          <ModuleChooser
            skeleton={skeleton}
            tank={turretTankId}
            turret={turretTurretId}
            onSelect={(tank) => {
              Mixer.mutate((draft) => {
                draft.turret = {
                  tank,
                  turret: tank.turrets.at(-1)!,
                };
              });
            }}
          />
          <ModuleSeparator />
          <ModuleChooser
            skeleton={skeleton}
            tank={gunTankId}
            turret={gunTurretId}
            gun={gunGunId}
            onSelect={(tank) => {
              Mixer.mutate((draft) => {
                draft.gun = {
                  tank,
                  turret: tank.turrets.at(-1)!,
                  gun: tank.turrets.at(-1)!.guns.at(-1)!,
                };
              });
            }}
          />
        </Flex>
      </Flex>
    </Box>
  );
}
