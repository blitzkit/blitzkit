import { resolvePenetrationCoefficient } from "@blitzkit/core";
import { useEffect } from "react";
import {
  AdditiveBlending,
  MeshBasicMaterial,
  Object3D,
  Plane,
  ShaderMaterial,
} from "three";
import { jsxTree } from "../../core/blitzkit/jsxTree";
import { DuelModule, getDuel } from "../../hooks/useDuel";
import { hasEquipment } from "../../hooks/useEquipment";
import { Tankopedia } from "../../stores/tankopedia";
import { ArmorType } from "../SpacedArmorScene";
import type {
  ArmorUserData,
  ExternalModuleVariant,
} from "../SpacedArmorSceneComponent";
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
        tankopediaEphemeral.customShell ??
        getDuel("antagonist", DuelModule.Shell);
      material.uniforms.penetration.value = shell.penetration!.near;
    }
    function handleProtagonistEquipmentChange() {
      const protagonist = getDuel("protagonist", DuelModule.Tank);

      const hasEnhancedArmor = hasEquipment(
        110,
        protagonist.equipment_preset,
        Tankopedia.state.protagonist.equipment,
      );
      const equalizer =
        (Tankopedia.state.equalize
          ? protagonist.equalizer?.armor
          : undefined) ?? 1;

      material.uniforms.thickness.value =
        thickness * (hasEnhancedArmor ? 1.04 : 1) * equalizer;
    }
    function handleAntagonistEquipmentChange() {
      const antagonist = getDuel("antagonist", DuelModule.Tank);

      const tankopediaEphemeral = Tankopedia.state;
      const shell =
        tankopediaEphemeral.customShell ??
        getDuel("antagonist", DuelModule.Shell);
      const penetration = shell.penetration!.near;
      const hasCalibratedShells = hasEquipment(
        103,
        antagonist.equipment_preset,
        Tankopedia.state.antagonist.equipment,
      );
      const equalize =
        (Tankopedia.state.equalize
          ? antagonist.equalizer?.penetration
          : undefined) ?? 1;

      material.uniforms.penetration.value =
        penetration *
        resolvePenetrationCoefficient(
          hasCalibratedShells,
          Tankopedia.state.equalize,
          shell.type,
          antagonist.equalizer,
        ) *
        equalize;
    }

    handleShellChange();
    handleProtagonistEquipmentChange();
    handleAntagonistEquipmentChange();

    const unsubscribes = [
      Tankopedia.on((state) => state.antagonist.shell, handleShellChange),
      Tankopedia.on((state) => state.customShell, handleShellChange),
      Tankopedia.on(
        (state) => state.protagonist.equipment,
        handleProtagonistEquipmentChange,
      ),
      Tankopedia.on(
        (state) => state.antagonist.equipment,
        handleAntagonistEquipmentChange,
      ),
      Tankopedia.on(
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
