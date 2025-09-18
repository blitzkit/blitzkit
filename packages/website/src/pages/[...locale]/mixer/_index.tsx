import { asset } from "@blitzkit/core";
import { CaretRightIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Skeleton,
  Text,
  type ButtonProps,
} from "@radix-ui/themes";
import { useRef, useState } from "react";
import { MixerScene } from "../../../components/MixerScene";
import { PageWrapper } from "../../../components/PageWrapper";
import {
  TankSearch,
  type TankSearchProps,
} from "../../../components/TankSearch";
import { awaitableModelDefinitions } from "../../../core/awaitables/modelDefinitions";
import { awaitableTankDefinitions } from "../../../core/awaitables/tankDefinitions";
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from "../../../hooks/useLocale";
import { Mixer } from "../../../stores/mixer";
import type { MaybeSkeletonComponentProps } from "../../../types/maybeSkeletonComponentProps";

const tankDefinitions = await awaitableTankDefinitions;
const modelDefinitions = await awaitableModelDefinitions;
const tanks = Object.values(tankDefinitions.tanks).filter((tank) => {
  const tankModel = modelDefinitions.models[tank.id];
  const turret = tank.turrets.at(-1)!;
  const turretModel = tankModel.turrets[turret.id];

  return tank.tier >= 10 && !turretModel.yaw;
});

export function Page({
  locale,
  skeleton,
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  const hull = useRef(tanks[Math.floor(Math.random() * tanks.length)]);
  const turretTank = useRef(tanks[Math.floor(Math.random() * tanks.length)]);
  const turret = useRef(
    turretTank.current.turrets[
      Math.floor(Math.random() * turretTank.current.turrets.length)
    ]
  );
  const gunTank = useRef(tanks[Math.floor(Math.random() * tanks.length)]);
  const gunTurret = useRef(
    gunTank.current.turrets[
      Math.floor(Math.random() * gunTank.current.turrets.length)
    ]
  );
  const gun = useRef(
    gunTurret.current.guns[
      Math.floor(Math.random() * gunTurret.current.guns.length)
    ]
  );

  Mixer.useInitialization({
    hull: hull.current,
    turret: { tank: turretTank.current, turret: turret.current },
    gun: {
      tank: gunTank.current,
      turret: gunTurret.current,
      gun: gun.current,
    },
  });

  return (
    <PageWrapper color="gray" p="0" maxWidth="unset">
      <LocaleProvider locale={locale}>
        <Content skeleton={skeleton} />
      </LocaleProvider>
    </PageWrapper>
  );
}

function ModuleButton({
  skeleton,
  tank,
  onSelect,
  ...props
}: Omit<ButtonProps, "onSelect"> &
  MaybeSkeletonComponentProps & {
    tank: number;
    onSelect: TankSearchProps["onSelect"];
  }) {
  const { strings } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button
          variant="surface"
          size="4"
          style={{ overflow: "clip" }}
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
  const hullId = Mixer.use((state) => state.hull.id);
  const turretId = Mixer.use((state) => state.turret.tank.id);
  const gunId = Mixer.use((state) => state.gun.tank.id);

  return (
    <Box flexGrow="1" position="relative">
      <Box position="absolute" width="100%" height="100%" top="0" left="0">
        {!skeleton && <MixerScene />}
      </Box>

      <Flex
        gap="2"
        align="center"
        position="absolute"
        bottom="4"
        left="50%"
        style={{ transform: "translateX(-50%)" }}
      >
        <ModuleButton
          skeleton={skeleton}
          tank={hullId}
          onSelect={(tank) => {
            Mixer.mutate((draft) => {
              draft.hull = tank;
            });
          }}
        />
        <ModuleSeparator />
        <ModuleButton
          skeleton={skeleton}
          tank={turretId}
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
        <ModuleButton
          skeleton={skeleton}
          tank={gunId}
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
    </Box>
  );
}
