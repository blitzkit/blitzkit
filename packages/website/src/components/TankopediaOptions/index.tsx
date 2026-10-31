import { Tankopedia } from "../../stores/tankopedia";
import { TankopediaDisplay } from "../../stores/tankopediaPersistent/constants";
import { SegmentedControl } from "../SegmentedControl";
import styles from "./index.module.css";

export function TankopediaOptions() {
  const requestedDisplay = Tankopedia.use(
    (state) => state.loaders.display.requested,
  );
  const isVisible = Tankopedia.use((state) => state.showControls);

  return (
    <div className={styles.options} data-visible={isVisible}>
      {/* <div className={styles.controls}>
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

            <DropdownMenu.Root>
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
            </DropdownMenu.Root>

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
      </div> */}

      <div>
        <SegmentedControl
          onValueChange={(value) => {
            Tankopedia.mutate((draft) => {
              draft.loaders.display.requested = Number(value);
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

        {/* {requestedDisplay === TankopediaDisplay.DynamicArmor && (
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

              <Tabs.Root value={tab} onValueChange={setTab}>
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
        )} */}
      </div>
    </div>
  );
}
