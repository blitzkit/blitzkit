import {
  asset,
  resolvePenetrationCoefficient,
  TIER_ROMAN_NUMERALS,
  uniqueGuns,
} from '@blitzkit/core';
import { literals } from '@blitzkit/i18n/src/literals';
import {
  CameraIcon,
  CopyIcon,
  DownloadIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  EyeOpenIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Checkbox,
  Dialog,
  DropdownMenu,
  Flex,
  IconButton,
  Popover,
  SegmentedControl,
  Tabs,
  Text,
  Tooltip,
} from '@radix-ui/themes';
import { Suspense, useState, type RefObject } from 'react';
import { Pose, poseEvent } from '../../../../../core/blitzkit/pose';
import { useEquipment } from '../../../../../hooks/useEquipment';
import { useFullScreen } from '../../../../../hooks/useFullScreen';
import { useFullscreenAvailability } from '../../../../../hooks/useFullscreenAvailability';
import { useLocale } from '../../../../../hooks/useLocale';
import { App } from '../../../../../stores/app';
import { Duel } from '../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../../stores/tankopediaPersistent';
import { TankopediaDisplay } from '../../../../../stores/tankopediaPersistent/constants';
import type { MaybeSkeletonComponentProps } from '../../../../../types/maybeSkeletonComponentProps';
import type { ThicknessRange } from '../../../../Armor/components/StaticArmor';
import { ModuleButton } from '../../../../ModuleButtons/ModuleButton';
import { SmallTankIcon } from '../../../../SmallTankIcon';
import { TankSearch } from '../../../../TankSearch';
import { CustomShellButton } from './components/CustomShellButton';
import { DynamicArmorSwitcher } from './components/DynamicArmorSwitcher';
import { QuickInputs } from './components/QuickInputs';
import { Thicknesses } from './components/Thicknesses';

type OptionsProps = MaybeSkeletonComponentProps & {
  thicknessRange: ThicknessRange;
  canvas: RefObject<HTMLCanvasElement>;
};

export function Options({ thicknessRange, canvas, skeleton }: OptionsProps) {
  const hasCustomShell = TankopediaEphemeral.use(
    (state) => state.customShell !== undefined,
  );
  const display = TankopediaEphemeral.use((state) => state.display);
  const isFullScreen = useFullScreen();
  const showGrid = TankopediaPersistent.use((state) => state.showGrid);
  const greenPenetration = TankopediaPersistent.use(
    (state) => state.greenPenetration,
  );
  const hideTankModelUnderArmor = TankopediaPersistent.use(
    (state) => state.hideTankModelUnderArmor,
  );
  const advancedHighlighting = TankopediaPersistent.use(
    (state) => state.advancedHighlighting,
  );
  const wireframe = TankopediaPersistent.use((state) => state.wireframe);
  const opaque = TankopediaPersistent.use((state) => state.opaque);
  const fullScreenAvailable = useFullscreenAvailability(true);
  const developerMode = App.use((state) => state.developerMode);
  const protagonistTank = Duel.use((state) => state.protagonist.tank);
  const antagonistGun = Duel.use((state) => state.antagonist.gun);
  const antagonistShell = Duel.use((state) => state.antagonist.shell);
  const [antagonistSelectorOpen, setAntagonistSelectorOpen] = useState(false);
  const antagonistTank = Duel.use((state) => state.antagonist.tank);
  const hasCalibratedShells = useEquipment(103, true);
  const [tab, setTab] = useState('search');
  const mutateDuel = Duel.useMutation();
  const hasEnhancedArmor = useEquipment(110);
  const antagonistUniqueGuns = uniqueGuns(antagonistTank.turrets);
  const mutateTankopediaPersistent = TankopediaPersistent.useMutation();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const { strings, unwrap } = useLocale();
  const revealed = TankopediaEphemeral.use((state) => state.revealed);
  const disturbed = TankopediaEphemeral.use((state) => state.disturbed);

  return (
    <>
      {disturbed && <QuickInputs />}

      <Thicknesses skeleton={skeleton} thicknessRange={thicknessRange} />

      <Flex
        gap="2"
        direction="column"
        top="50%"
        right={display === TankopediaDisplay.DynamicArmor ? '3' : '-4rem'}
        style={{
          position: 'absolute',
          transform: 'translateY(-50%)',
          transitionDuration: '200ms',
        }}
        align="end"
      >
        {!hasCustomShell && (
          <Text color="gray" size={{ initial: '1', sm: '2' }}>
            {literals(strings.common.units.mm, [
              (
                resolvePenetrationCoefficient(
                  hasCalibratedShells,
                  antagonistShell.type,
                ) * antagonistShell.penetration.near
              ).toFixed(0),
            ])}
          </Text>
        )}

        {antagonistUniqueGuns.length > 1 && (
          <Popover.Root>
            <Popover.Trigger>
              <IconButton
                radius="full"
                variant="soft"
                color="gray"
                size={{ initial: '2', sm: '3' }}
                style={{ position: 'relative' }}
              >
                <Text
                  size="1"
                  color="gray"
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                  }}
                  mr="2"
                  mb="1"
                >
                  {TIER_ROMAN_NUMERALS[antagonistGun.tier]}
                </Text>

                <img
                  alt="Antagonist Gun"
                  src={asset('icons/modules/gun.webp')}
                  style={{
                    width: '65%',
                    height: '65%',
                    objectFit: 'contain',
                  }}
                />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content side="left" align="center">
              <Flex gap="2">
                {[...antagonistUniqueGuns].reverse().map(({ gun, turret }) => (
                  <ModuleButton
                    module="gun"
                    key={gun.id}
                    onClick={() =>
                      mutateDuel((draft) => {
                        draft.antagonist.turret = turret;
                        draft.antagonist.gun = gun;
                        draft.antagonist.shell = gun.shells[0];
                      })
                    }
                    selected={gun.id === antagonistGun.id}
                    discriminator={TIER_ROMAN_NUMERALS[gun.tier]}
                    secondaryDiscriminator={
                      <Text style={{ fontSize: '0.75em' }}>
                        {literals(strings.common.units.mm, [
                          gun.shells[0].caliber.toFixed(0),
                        ])}
                      </Text>
                    }
                  />
                ))}
              </Flex>
            </Popover.Content>
          </Popover.Root>
        )}

        <Flex
          direction="column"
          style={{
            borderRadius: 'var(--radius-full)',
          }}
          overflow="hidden"
        >
          {antagonistGun.shells.map((thisShell) => (
            <IconButton
              color={
                thisShell.id === antagonistShell.id && !hasCustomShell
                  ? undefined
                  : 'gray'
              }
              variant="soft"
              key={thisShell.id}
              size={{ initial: '2', sm: '3' }}
              radius="none"
              onClick={() => {
                mutateDuel((draft) => {
                  draft.antagonist.shell = thisShell;
                });
                mutateTankopediaEphemeral((draft) => {
                  draft.shot = undefined;
                  draft.customShell = undefined;
                });
              }}
            >
              <img
                alt={unwrap(thisShell.name)}
                src={asset(`icons/shells/${thisShell.icon}.webp`)}
                style={{
                  width: '50%',
                  height: '50%',
                }}
              />
            </IconButton>
          ))}

          <CustomShellButton />
        </Flex>

        <Flex
          direction="column"
          style={{
            pointerEvents: 'auto',
            borderRadius: 'var(--radius-full)',
          }}
          overflow="hidden"
        >
          <IconButton
            color={hasCalibratedShells ? undefined : 'gray'}
            variant="soft"
            size={{ initial: '2', sm: '3' }}
            radius="none"
            onClick={() => {
              mutateDuel((draft) => {
                draft.antagonist.equipmentMatrix[0][0] = hasCalibratedShells
                  ? 0
                  : 1;
              });
              mutateTankopediaEphemeral((draft) => {
                draft.shot = undefined;
              });
            }}
          >
            <img
              alt="Calibrated Shells"
              src={asset('icons/equipment/103.webp')}
              style={{
                width: '50%',
                height: '50%',
              }}
            />
          </IconButton>
          <IconButton
            color={hasEnhancedArmor ? undefined : 'gray'}
            variant="soft"
            size={{ initial: '2', sm: '3' }}
            radius="none"
            onClick={() => {
              mutateDuel((draft) => {
                draft.protagonist.equipmentMatrix[1][1] = hasEnhancedArmor
                  ? 0
                  : -1;
              });
              mutateTankopediaEphemeral((draft) => {
                draft.shot = undefined;
              });
            }}
          >
            <img
              alt="Enhanced Armor"
              src={asset('icons/equipment/110.webp')}
              style={{
                width: '50%',
                height: '50%',
              }}
            />
          </IconButton>
        </Flex>

        {!skeleton && (
          <Suspense>
            <DynamicArmorSwitcher />
          </Suspense>
        )}
      </Flex>

      <Flex
        direction="column"
        align="center"
        position="absolute"
        bottom={revealed ? '4' : '-100%'}
        left="50%"
        style={{ transform: 'translateX(-50%)', transitionDuration: '200ms' }}
      >
        <Flex
          direction="column"
          align="center"
          style={{ transitionDuration: '200ms' }}
          position="relative"
          bottom={display === TankopediaDisplay.DynamicArmor ? '0' : '-7rem'}
        >
          <Flex
            align="center"
            gap="2"
            mb="1"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              mutateTankopediaPersistent((draft) => {
                draft.advancedHighlighting = !draft.advancedHighlighting;
              });
            }}
          >
            <Checkbox variant="classic" checked={advancedHighlighting} />
            <Text color="gray" size="2">
              {strings.website.tools.tankopedia.sandbox.dynamic.advanced}
            </Text>
          </Flex>

          <Flex align="center" gap="2">
            <Text color="gray" size="2">
              {strings.website.tools.tankopedia.sandbox.dynamic.shooter}
            </Text>
            <Dialog.Root
              open={antagonistSelectorOpen}
              onOpenChange={setAntagonistSelectorOpen}
            >
              <Dialog.Trigger>
                <Button variant="ghost">
                  <Flex gap="2" align="center">
                    <SmallTankIcon id={antagonistTank.id} size={16} />
                    {unwrap(antagonistTank.name)}
                  </Flex>
                </Button>
              </Dialog.Trigger>

              <Dialog.Content>
                <Dialog.Title align="center">Select tank</Dialog.Title>

                <Tabs.Root
                  value={tab}
                  onValueChange={setTab}
                  style={{ position: 'relative' }}
                >
                  <TankSearch
                    compact
                    onSelect={(tank) => {
                      mutateDuel((draft) => {
                        draft.antagonist.tank = tank;
                        draft.antagonist.engine = tank.engines.at(-1)!;
                        draft.antagonist.track = tank.tracks.at(-1)!;
                        draft.antagonist.turret = tank.turrets.at(-1)!;
                        draft.antagonist.gun =
                          draft.antagonist.turret.guns.at(-1)!;
                        draft.antagonist.shell = draft.antagonist.gun.shells[0];
                      });
                      setAntagonistSelectorOpen(false);
                    }}
                  />
                </Tabs.Root>
              </Dialog.Content>
            </Dialog.Root>
          </Flex>
        </Flex>

        <Flex gap="3" align="center" mt="2">
          <SegmentedControl.Root
            variant="classic"
            value={`${disturbed ? display : -1}`}
            onValueChange={(value) => {
              mutateTankopediaEphemeral((draft) => {
                draft.disturbed = true;
                draft.display = Number(value);
              });
            }}
          >
            <SegmentedControl.Item value={`${TankopediaDisplay.Model}`}>
              <Tooltip
                content={strings.website.tools.tankopedia.sandbox.model.name}
              >
                <Flex height="100%" align="center">
                  <img
                    src="/assets/images/icons/tankopedia-model.png"
                    style={{ height: '1.25em' }}
                  />
                </Flex>
              </Tooltip>
            </SegmentedControl.Item>
            <SegmentedControl.Item value={`${TankopediaDisplay.DynamicArmor}`}>
              <Tooltip
                content={strings.website.tools.tankopedia.sandbox.dynamic.name}
              >
                <Flex height="100%" align="center">
                  <img
                    src="/assets/images/icons/tankopedia-dynamic-armor.png"
                    style={{ height: '1.25em' }}
                  />
                </Flex>
              </Tooltip>
            </SegmentedControl.Item>
            <SegmentedControl.Item value={`${TankopediaDisplay.StaticArmor}`}>
              <Tooltip
                content={strings.website.tools.tankopedia.sandbox.static.name}
              >
                <Flex height="100%" align="center">
                  <img
                    src="/assets/images/icons/tankopedia-static-armor.png"
                    style={{ height: '1.25em' }}
                  />
                </Flex>
              </Tooltip>
            </SegmentedControl.Item>
          </SegmentedControl.Root>

          {disturbed && (
            <>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton variant="ghost" color="gray">
                    <EyeOpenIcon />
                  </IconButton>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content>
                  <DropdownMenu.Item
                    onClick={() => poseEvent.emit(Pose.HullDown)}
                  >
                    {strings.website.tools.tankopedia.sandbox.poses.hull_down}
                  </DropdownMenu.Item>

                  <DropdownMenu.Item
                    onClick={() => poseEvent.emit(Pose.FaceHug)}
                  >
                    {strings.website.tools.tankopedia.sandbox.poses.face_hug}
                  </DropdownMenu.Item>

                  <DropdownMenu.Item
                    onClick={() => poseEvent.emit(Pose.Default)}
                  >
                    {strings.website.tools.tankopedia.sandbox.poses.default}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton variant="ghost" color="gray">
                    <GearIcon />
                  </IconButton>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content>
                  {display === TankopediaDisplay.DynamicArmor && (
                    <>
                      <DropdownMenu.Label>
                        {
                          strings.website.tools.tankopedia.sandbox.settings
                            .armor
                        }
                      </DropdownMenu.Label>

                      <DropdownMenu.CheckboxItem
                        checked={greenPenetration}
                        onCheckedChange={(checked) => {
                          mutateTankopediaPersistent((draft) => {
                            draft.greenPenetration = checked;
                          });
                        }}
                      >
                        {
                          strings.website.tools.tankopedia.sandbox.settings
                            .green_penetration
                        }
                      </DropdownMenu.CheckboxItem>

                      <DropdownMenu.CheckboxItem
                        checked={hideTankModelUnderArmor}
                        onCheckedChange={(checked) => {
                          mutateTankopediaPersistent((draft) => {
                            draft.hideTankModelUnderArmor = checked;
                          });
                        }}
                      >
                        {
                          strings.website.tools.tankopedia.sandbox.settings
                            .hide_model_under_armor
                        }
                      </DropdownMenu.CheckboxItem>

                      <DropdownMenu.CheckboxItem
                        checked={opaque}
                        onCheckedChange={(checked) => {
                          mutateTankopediaPersistent((draft) => {
                            draft.opaque = checked;
                          });
                        }}
                      >
                        {
                          strings.website.tools.tankopedia.sandbox.settings
                            .opaque
                        }
                      </DropdownMenu.CheckboxItem>

                      {developerMode && (
                        <DropdownMenu.CheckboxItem
                          checked={wireframe}
                          onCheckedChange={(checked) => {
                            mutateTankopediaPersistent((draft) => {
                              draft.wireframe = checked;
                            });
                          }}
                        >
                          {
                            strings.website.tools.tankopedia.sandbox.settings
                              .dev_wireframe
                          }
                        </DropdownMenu.CheckboxItem>
                      )}
                    </>
                  )}

                  <DropdownMenu.Label>
                    {
                      strings.website.tools.tankopedia.sandbox.settings
                        .environment
                    }
                  </DropdownMenu.Label>

                  <DropdownMenu.CheckboxItem
                    checked={showGrid}
                    onCheckedChange={(checked) => {
                      mutateTankopediaPersistent((draft) => {
                        draft.showGrid = checked;
                      });
                    }}
                  >
                    {
                      strings.website.tools.tankopedia.sandbox.settings
                        .show_grid
                    }
                  </DropdownMenu.CheckboxItem>
                </DropdownMenu.Content>
              </DropdownMenu.Root>

              <Popover.Root>
                <Popover.Trigger>
                  <IconButton color="gray" variant="ghost">
                    <CameraIcon />
                  </IconButton>
                </Popover.Trigger>

                <Popover.Content>
                  <Flex direction="column" gap="2">
                    <Popover.Close>
                      <Button
                        onClick={() => {
                          if (!canvas.current) return;

                          const anchor = document.createElement('a');

                          anchor.setAttribute(
                            'download',
                            `${protagonistTank.name}.png`,
                          );
                          anchor.setAttribute(
                            'href',
                            canvas.current.toDataURL('image/png'),
                          );
                          anchor.click();
                        }}
                      >
                        <DownloadIcon />
                        {
                          strings.website.tools.tankopedia.sandbox.screenshot
                            .download
                        }
                      </Button>
                    </Popover.Close>
                    <Popover.Close>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!canvas.current) return;

                          canvas.current.toBlob((blob) => {
                            if (!blob) return;

                            navigator.clipboard.write([
                              new ClipboardItem({ 'image/png': blob }),
                            ]);
                          });
                        }}
                      >
                        <CopyIcon />
                        {
                          strings.website.tools.tankopedia.sandbox.screenshot
                            .copy
                        }
                      </Button>
                    </Popover.Close>
                  </Flex>
                </Popover.Content>
              </Popover.Root>

              {fullScreenAvailable && (
                <IconButton
                  color="gray"
                  variant="ghost"
                  onClick={() => {
                    if (isFullScreen) {
                      document.exitFullscreen();
                    } else document.body.requestFullscreen();
                  }}
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
        </Flex>
      </Flex>
    </>
  );
}
