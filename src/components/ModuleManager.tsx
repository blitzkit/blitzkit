import { DropdownMenu, Flex } from '@radix-ui/themes';
import { useState } from 'react';
import {
  EngineDefinition,
  GunDefinition,
  ShellDefinition,
  TankDefinition,
  TrackDefinition,
  TurretDefinition,
} from '../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../core/blitzkit/tankDefinitions/constants';
import { ModuleButton } from './ModuleButtons/ModuleButton';

interface ModuleManagerProps {
  tank: TankDefinition;
  turret: TurretDefinition;
  gun: GunDefinition;
  shell: ShellDefinition;
  engine: EngineDefinition;
  track: TrackDefinition;
  onChange?: (modules: {
    turret: TurretDefinition;
    gun: GunDefinition;
    engine: EngineDefinition;
    track: TrackDefinition;
  }) => void;
}

export function ModuleManager({
  tank,
  onChange,
  ...modules
}: ModuleManagerProps) {
  const [turretMenuOpen, setTurretMenuOpen] = useState(false);
  const [gunMenuOpen, setGunMenuOpen] = useState(false);
  const [engineMenuOpen, setEngineMenuOpen] = useState(false);
  const [trackMenuOpen, setTrackMenuOpen] = useState(false);

  return (
    <Flex gap="1" wrap="wrap">
      <ModuleButton
        module="turret"
        discriminator={TIER_ROMAN_NUMERALS[modules.turret.tier]}
        first
        last
        rowChild
        onClick={() => setTurretMenuOpen(true)}
      />

      <DropdownMenu.Root open={turretMenuOpen} onOpenChange={setTurretMenuOpen}>
        <DropdownMenu.Trigger>
          <div />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup value={`${modules.turret.id}`}>
            {[...tank.turrets].reverse().map((turret) => {
              return (
                <DropdownMenu.RadioItem
                  key={turret.id}
                  value={`${turret.id}`}
                  onClick={() => {
                    const draft = { ...modules };
                    draft.turret = turret;
                    draft.gun = draft.turret.guns.at(-1)!;
                    draft.shell = draft.gun.shells[0];

                    onChange?.(draft);
                    setTurretMenuOpen(false);
                  }}
                >
                  <ModuleButton
                    variant="ghost"
                    module="turret"
                    discriminator={TIER_ROMAN_NUMERALS[turret.tier]}
                  />{' '}
                  {turret.name}
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <ModuleButton
        module="gun"
        discriminator={TIER_ROMAN_NUMERALS[modules.gun.tier]}
        first
        last
        rowChild
        onClick={() => setGunMenuOpen(true)}
      />

      <DropdownMenu.Root open={gunMenuOpen} onOpenChange={setGunMenuOpen}>
        <DropdownMenu.Trigger>
          <div />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup value={`${modules.gun.id}`}>
            {[...modules.turret.guns].reverse().map((gun) => {
              return (
                <DropdownMenu.RadioItem
                  key={gun.id}
                  value={`${gun.id}`}
                  onClick={() => {
                    const draft = { ...modules };
                    draft.gun = gun;
                    draft.shell = draft.gun.shells[0];

                    onChange?.(draft);
                    setGunMenuOpen(false);
                  }}
                >
                  <ModuleButton
                    variant="ghost"
                    module="gun"
                    discriminator={TIER_ROMAN_NUMERALS[gun.tier]}
                  />{' '}
                  {gun.name}
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <ModuleButton
        module="engine"
        discriminator={TIER_ROMAN_NUMERALS[modules.engine.tier]}
        first
        last
        rowChild
        onClick={() => setEngineMenuOpen(true)}
      />

      <DropdownMenu.Root open={engineMenuOpen} onOpenChange={setEngineMenuOpen}>
        <DropdownMenu.Trigger>
          <div />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup value={`${modules.engine.id}`}>
            {[...tank.engines].reverse().map((engine) => {
              return (
                <DropdownMenu.RadioItem
                  key={engine.id}
                  value={`${engine.id}`}
                  onClick={() => {
                    const draft = { ...modules };
                    draft.engine = engine;

                    onChange?.(draft);
                    setEngineMenuOpen(false);
                  }}
                >
                  <ModuleButton
                    variant="ghost"
                    module="engine"
                    discriminator={TIER_ROMAN_NUMERALS[engine.tier]}
                  />{' '}
                  {engine.name}
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <ModuleButton
        module="chassis"
        discriminator={TIER_ROMAN_NUMERALS[modules.track.tier]}
        first
        last
        rowChild
        onClick={() => setTrackMenuOpen(true)}
      />

      <DropdownMenu.Root open={trackMenuOpen} onOpenChange={setTrackMenuOpen}>
        <DropdownMenu.Trigger>
          <div />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup value={`${modules.track.id}`}>
            {[...tank.tracks].reverse().map((track) => {
              return (
                <DropdownMenu.RadioItem
                  key={track.id}
                  value={`${track.id}`}
                  onClick={() => {
                    const draft = { ...modules };
                    draft.track = track;

                    onChange?.(draft);
                    setTrackMenuOpen(false);
                  }}
                >
                  <ModuleButton
                    variant="ghost"
                    module="chassis"
                    discriminator={TIER_ROMAN_NUMERALS[track.tier]}
                  />{' '}
                  {track.name}
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Flex>
  );
}
