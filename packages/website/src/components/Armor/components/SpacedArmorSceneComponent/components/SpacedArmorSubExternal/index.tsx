import { resolvePenetrationCoefficient } from "@blitzkit/core";
import { useEffect } from "react";
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  Plane,
  ShaderMaterial,
} from "three";
import type { ArmorUserData, ExternalModuleVariant } from "../..";
import { hasEquipment } from "../../../../../../core/blitzkit/hasEquipment";
import { jsxTree } from "../../../../../../core/blitzkit/jsxTree";
import { Duel } from "../../../../../../stores/duel";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { ArmorType } from "../../../SpacedArmorScene";
import fragmentShader from "./shaders/fragment.glsl?raw";
import vertexShader from "./shaders/vertex.glsl?raw";

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
      const tankopediaEphemeral = Tankopedia.state;
      const shell =
        tankopediaEphemeral.customShell ?? Duel.state.antagonist.shell;
      material.uniforms.penetration.value = shell.penetration!.near;
    }
    function handleProtagonistEquipmentChange() {
      const equipment = Duel.state.protagonist.equipmentMatrix;
      const hasEnhancedArmor = hasEquipment(
        110,
        Duel.state.protagonist.tank.equipment_preset,
        equipment,
      );
      const equalizer =
        (Duel.state.equalize
          ? Duel.state.protagonist.tank.equalizer?.armor
          : undefined) ?? 1;

      material.uniforms.thickness.value =
        thickness * (hasEnhancedArmor ? 1.03 : 1) * equalizer;
    }
    function handleAntagonistEquipmentChange() {
      const equipment = Duel.state.antagonist.equipmentMatrix;
      const tankopediaEphemeral = Tankopedia.state;
      const shell =
        tankopediaEphemeral.customShell ?? Duel.state.antagonist.shell;
      const penetration = shell.penetration!.near;
      const hasCalibratedShells = hasEquipment(
        103,
        Duel.state.antagonist.tank.equipment_preset,
        equipment,
      );
      const equalize =
        (Duel.state.equalize
          ? Duel.state.antagonist.tank.equalizer?.penetration
          : undefined) ?? 1;

      material.uniforms.penetration.value =
        penetration *
        resolvePenetrationCoefficient(
          hasCalibratedShells,
          Duel.state.equalize,
          shell.type,
          Duel.state.antagonist.tank.equalizer,
        ) *
        equalize;
    }

    handleShellChange();
    handleProtagonistEquipmentChange();
    handleAntagonistEquipmentChange();

    const unsubscribes = [
      Duel.on((state) => state.antagonist.shell, handleShellChange),
      Tankopedia.on((state) => state.customShell, handleShellChange),
      Duel.on(
        (state) => state.protagonist.equipmentMatrix,
        handleProtagonistEquipmentChange,
      ),
      Duel.on(
        (state) => state.antagonist.equipmentMatrix,
        handleAntagonistEquipmentChange,
      ),
      Duel.on(
        (state) => state.equalize,
        () => {
          handleProtagonistEquipmentChange();
          handleAntagonistEquipmentChange();
        },
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
