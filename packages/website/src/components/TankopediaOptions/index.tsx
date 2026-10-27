import { uniqueGuns } from "@blitzkit/core";
import { ShadowInnerIcon, ShadowNoneIcon } from "@radix-ui/react-icons";
import { useState, type RefObject } from "react";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useEquipment } from "../../hooks/useEquipment";
import { useFullScreen } from "../../hooks/useFullScreen";
import { useFullscreenAvailability } from "../../hooks/useFullscreenAvailability";
import { useStrings } from "../../hooks/useStrings";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Tankopedia } from "../../stores/tankopedia";
import { TankopediaPersistent } from "../../stores/tankopediaPersistent";
import { TankopediaDisplay } from "../../stores/tankopediaPersistent/constants";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { IconButton } from "../IconButton";
import { SegmentedControl } from "../SegmentedControl";
import styles from "./index.module.css";

type OptionsProps = MaybeSkeletonComponentProps & {
  canvas: RefObject<HTMLCanvasElement>;
};

export function TankopediaOptions({ canvas, skeleton }: OptionsProps) {
  const strings = useStrings();
  const unwrap = useUnwrapper();

  const hasCustomShell = Tankopedia.use(
    (state) => state.customShell !== undefined,
  );
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);
  const isFullScreen = useFullScreen();
  const advancedHighlighting = TankopediaPersistent.use(
    (state) => state.advancedHighlighting,
  );
  const fullScreenAvailable = useFullscreenAvailability(true);
  const protagonistTank = useDuel("protagonist", DuelModule.Tank);
  const antagonistGun = useDuel("antagonist", DuelModule.Gun);
  const antagonistShell = useDuel("antagonist", DuelModule.Shell);
  const [antagonistSelectorOpen, setAntagonistSelectorOpen] = useState(false);
  const antagonistTank = useDuel("antagonist", DuelModule.Tank);
  const hasCalibratedShells = useEquipment("protagonist", 103);
  const [tab, setTab] = useState("search");
  const hasEnhancedArmor = useEquipment("protagonist", 110);
  const antagonistUniqueGuns = uniqueGuns(antagonistTank.turrets);
  const revealed = Tankopedia.use((state) => state.revealed);
  const disturbed = Tankopedia.use((state) => state.disturbed);
  const highGraphics = TankopediaPersistent.use((state) => state.highGraphics);
  const modelRequested = Tankopedia.use((state) => state.modelRequested);
  const equalize = Tankopedia.use((state) => state.environment.equalize);

  return (
    <div className={styles.options}>
      <div className={styles.controls}>
        {disturbed && (
          <>
            {requestedDisplay === TankopediaDisplay.DynamicArmor && (
              <IconButton
                size="minor"
                highContrast
                onClick={() => {
                  TankopediaPersistent.mutate((draft) => {
                    draft.advancedHighlighting = !draft.advancedHighlighting;
                  });
                }}
                color={advancedHighlighting ? undefined : "gray"}
                variant={advancedHighlighting ? "solid" : "surface"}
              >
                {advancedHighlighting ? (
                  <ShadowInnerIcon />
                ) : (
                  <ShadowNoneIcon />
                )}
              </IconButton>
            )}

            {/* <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton
                  size="2"
                  variant="surface"
                  highContrast
                  color="gray"
                >
                  <EyeOpenIcon />
                </IconButton>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content>
                <DropdownMenu.Item
                  onClick={() => poseEvent.emit(Pose.HullDown)}
                >
                  {strings.tanks.poses.hull_down}
                </DropdownMenu.Item>

                <DropdownMenu.Item onClick={() => poseEvent.emit(Pose.FaceHug)}>
                  {strings.tanks.poses.face_hug}
                </DropdownMenu.Item>

                <DropdownMenu.Item onClick={() => poseEvent.emit(Pose.Default)}>
                  {strings.tanks.poses.default}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root> */}

            <IconButton
              size="2"
              highContrast
              onClick={() => {
                TankopediaPersistent.mutate((draft) => {
                  draft.highGraphics = !draft.highGraphics;
                });
              }}
              color={highGraphics ? undefined : "gray"}
              variant={highGraphics ? "solid" : "surface"}
            >
              <SunIcon />
            </IconButton>

            <ScreenshotButton
              color="gray"
              size="2"
              variant="surface"
              highContrast
              canvas={canvas}
              name={protagonistTank.slug}
            />

            {fullScreenAvailable && (
              <IconButton
                size="2"
                highContrast
                onClick={() => {
                  if (isFullScreen) {
                    document.exitFullscreen();
                  } else document.body.requestFullscreen();
                }}
                color={isFullScreen ? undefined : "gray"}
                variant={isFullScreen ? "solid" : "surface"}
              >
                {isFullScreen ? (
                  <ExitFullScreenIcon />
                ) : (
                  <EnterFullScreenIcon />
                )}
              </IconButton>
            )}
          </>
        )}
      </div>

      <div gap="3" align="center" mt="2">
        <SegmentedControl
          onValueChange={(value) => {
            Tankopedia.mutate((draft) => {
              draft.requestedDisplay = Number(value);
            });
          }}
          value={`${requestedDisplay}`}
          options={[
            {
              label: <img src="/assets/images/icons/tankopedia-model.png" />,
              value: `${TankopediaDisplay.Model}`,
            },
            {
              label: (
                <img src="/assets/images/icons/tankopedia-dynamic-armor.png" />
              ),
              value: `${TankopediaDisplay.DynamicArmor}`,
            },
            {
              label: (
                <img src="/assets/images/icons/tankopedia-static-armor.png" />
              ),
              value: `${TankopediaDisplay.StaticArmor}`,
            },
          ]}
        />
        {/* <SegmentedControl.Root
          variant="classic"
          value={`${disturbed ? requestedDisplay : -1}`}
          onValueChange={(value) => {
            Tankopedia.mutate((draft) => {
              draft.disturbed = true;
              draft.requestedDisplay = Number(value);
            });
          }}
        >
          <SegmentedControl.Item value={`${TankopediaDisplay.Model}`}>
            <Tooltip tooltip={strings.tanks.tabs.model}>
              <div height="100%" align="center">
                
            </Tooltip>
          </SegmentedControl.Item>
          <SegmentedControl.Item value={`${TankopediaDisplay.DynamicArmor}`}>
            <Tooltip tooltip={strings.tanks.tabs.dynamic_armor}>
              <div height="100%" align="center">
                <img
                  src="/assets/images/icons/tankopedia-dynamic-armor.png"
                  style={{ height: "1.25em" }}
                />
              </div>
            </Tooltip>
          </SegmentedControl.Item>
          <SegmentedControl.Item value={`${TankopediaDisplay.StaticArmor}`}>
            <Tooltip tooltip={strings.tanks.tabs.model}>
              <div height="100%" align="center">
                <img
                  src="/assets/images/icons/tankopedia-static-armor.png"
                  style={{ height: "1.25em" }}
                />
              </div>
            </Tooltip>
          </SegmentedControl.Item>
        </SegmentedControl.Root> */}

        {requestedDisplay === TankopediaDisplay.DynamicArmor && (
          <Dialog.Root
            open={antagonistSelectorOpen}
            onOpenChange={setAntagonistSelectorOpen}
          >
            <Dialog.Trigger>
              <Button variant="solid" highContrast>
                <Crosshair1Icon />
                {unwrap(antagonistTank.name!)}
                <SmallTankIcon id={antagonistTank.id} size={16} />
              </Button>
            </Dialog.Trigger>

            <Dialog.Content>
              <Dialog.Title align="center">
                {strings.website.common.tank_search.select_dialog_title}
              </Dialog.Title>

              <Tabs.Root
                value={tab}
                onValueChange={setTab}
                style={{ position: "relative" }}
              >
                <TankSearch
                  compact
                  onSelect={(tank) => {
                    Tankopedia.mutate((draft) => {
                      draft.antagonist.tank = tank.id;
                      draft.antagonist.engine = tank.engines.at(-1)!.id;
                      draft.antagonist.track = tank.tracks.at(-1)!.id;

                      const turret = tank.turrets.at(-1)!;
                      const gun = turret.guns.at(-1)!;

                      draft.antagonist.turret = turret.id;
                      draft.antagonist.gun = gun.id;
                      draft.antagonist.shell = gun.shells[0].id;
                    });
                    setAntagonistSelectorOpen(false);
                  }}
                />
              </Tabs.Root>
            </Dialog.Content>
          </Dialog.Root>
        )}
      </div>
    </div>
  );
}
