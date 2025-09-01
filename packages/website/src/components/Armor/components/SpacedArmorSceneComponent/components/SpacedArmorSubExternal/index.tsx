import { resolvePenetrationCoefficient } from '@blitzkit/core';
import { useEffect } from 'react';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  Plane,
  ShaderMaterial,
} from 'three';
import type { ArmorUserData, ExternalModuleVariant } from '../..';
import { hasEquipment } from '../../../../../../core/blitzkit/hasEquipment';
import { jsxTree } from '../../../../../../core/blitzkit/jsxTree';
import { Duel, type EquipmentMatrix } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { ArmorType } from '../../../SpacedArmorScene';
import fragmentShader from './shaders/fragment.glsl?raw';
import vertexShader from './shaders/vertex.glsl?raw';

interface SpacedArmorSubExternalProps {
  node: Object3D;
  thickness: number;
  variant: ExternalModuleVariant;
  clip?: Plane;
}

export function SpacedArmorSubExternal({
  node,
  thickness,
  variant,
  clip,
}: SpacedArmorSubExternalProps) {
  const duelStore = Duel.useStore();
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending,
    clipping: clip !== undefined,
    ...(clip ? { clippingPlanes: [clip] } : {}),

    uniforms: {
      thickness: { value: null },
      penetration: { value: null },
    },
  });

  useEffect(() => {
    function handleShellChange() {
      const duel = duelStore.getState();
      const tankopediaEphemeral = TankopediaEphemeral.state;
      const shell = tankopediaEphemeral.customShell ?? duel.antagonist.shell;
      material.uniforms.penetration.value = shell.penetration.near;
    }
    function handleProtagonistEquipmentChange(equipment: EquipmentMatrix) {
      const duel = duelStore.getState();
      const hasEnhancedArmor = hasEquipment(
        110,
        duel.protagonist.tank.equipment_preset,
        equipment,
      );
      material.uniforms.thickness.value = hasEnhancedArmor
        ? thickness * 1.03
        : thickness;
    }
    function handleAntagonistEquipmentChange(equipment: EquipmentMatrix) {
      const duel = duelStore.getState();
      const tankopediaEphemeral = TankopediaEphemeral.state;
      const shell = tankopediaEphemeral.customShell ?? duel.antagonist.shell;
      const penetration = shell.penetration.near;
      const hasCalibratedShells = hasEquipment(
        103,
        duel.antagonist.tank.equipment_preset,
        equipment,
      );

      material.uniforms.penetration.value =
        penetration *
        resolvePenetrationCoefficient(hasCalibratedShells, shell.type);
    }

    handleShellChange();
    handleProtagonistEquipmentChange(
      duelStore.getState().protagonist.equipmentMatrix,
    );
    handleAntagonistEquipmentChange(
      duelStore.getState().antagonist.equipmentMatrix,
    );

    const unsubscribes = [
      duelStore.subscribe((state) => state.antagonist.shell, handleShellChange),
      TankopediaEphemeral.on((state) => state.customShell, handleShellChange),
      duelStore.subscribe(
        (state) => state.protagonist.equipmentMatrix,
        handleProtagonistEquipmentChange,
      ),
      duelStore.subscribe(
        (state) => state.antagonist.equipmentMatrix,
        handleAntagonistEquipmentChange,
      ),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  });

  return (
    <>
      {jsxTree(node, {
        group(_, props, key) {
          return (
            <group {...props} key={`${key}-spaced-sub-external-exclude`} />
          );
        },

        mesh(_, props, key) {
          return (
            <mesh
              {...props}
              onClick={() => {}}
              key={`${key}-spaced-sub-external-exclude`}
              renderOrder={3}
              material={
                new MeshBasicMaterial({
                  colorWrite: false,
                  depthTest: true,
                  depthWrite: true,
                  ...(clip ? { clippingPlanes: [clip] } : {}),
                })
              }
              userData={
                {
                  type: ArmorType.External,
                  thickness,
                  variant,
                } satisfies ArmorUserData
              }
            />
          );
        },
      })}

      {jsxTree(node, {
        group(_, props, key) {
          return (
            <group {...props} key={`${key}-spaced-sub-external-include`} />
          );
        },

        mesh(_, props, key) {
          return (
            <mesh
              {...props}
              key={`${key}-spaced-sub-external-include`}
              renderOrder={4}
              material={material}
            />
          );
        },
      })}
    </>
  );
}
