import { asset } from "@blitzkit/core";
import { CaretRightIcon, UpdateIcon } from "@radix-ui/react-icons";
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
import { ScreenshotButton } from "../../../components/ScreenshotButton";
import {
  TankSearch,
  type TankSearchProps,
} from "../../../components/TankSearch";
import { curateMixer } from "../../../core/blitzkit/curateMixer";
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from "../../../hooks/useLocale";
import { Mixer } from "../../../stores/mixer";
import type { MaybeSkeletonComponentProps } from "../../../types/maybeSkeletonComponentProps";

export function Page({
  locale,
  skeleton,
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  const initial = useRef(curateMixer());

  Mixer.useInitialization(initial.current);

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
  const hull = Mixer.use((state) => state.hull);
  const turretId = Mixer.use((state) => state.turret.tank.id);
  const gunId = Mixer.use((state) => state.gun.tank.id);
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
            name={hull.slug}
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
          <ModuleButton
            skeleton={skeleton}
            tank={hull.id}
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
      </Flex>
    </Box>
  );
}
