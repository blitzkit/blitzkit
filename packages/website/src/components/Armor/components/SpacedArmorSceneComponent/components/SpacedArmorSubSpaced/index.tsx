import { isExplosive, resolvePenetrationCoefficient } from "@blitzkit/core";
import { useEffect } from "react";
import {
  AdditiveBlending,
  MeshBasicMaterial,
  ShaderMaterial,
  type Object3D,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import type { ArmorUserData } from "../..";
import { hasEquipment } from "../../../../../../core/blitzkit/hasEquipment";
import { jsxTree } from "../../../../../../core/blitzkit/jsxTree";
import { Duel, type EquipmentMatrix } from "../../../../../../stores/duel";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { ArmorType } from "../../../SpacedArmorScene";
import fragmentShader from "./shaders/fragment.glsl?raw";
import vertexShader from "./shaders/vertex.glsl?raw";

interface SpacedArmorSubSpacedProps {
  node: Object3D;
  thickness: number;
}

const depthWriteMaterial = new MeshBasicMaterial({
  depthWrite: true,
  colorWrite: false,
});

export function SpacedArmorSubSpaced({
  node,
  thickness,
}: SpacedArmorSubSpacedProps) {
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending,

    uniforms: {
      thickness: { value: null },
      penetration: { value: null },
      caliber: { value: null },
      ricochet: { value: null },
      normalization: { value: null },
    },
  });

  useEffect(() => {
    function handleShellChange() {
      const tankopediaEphemeral = Tankopedia.state;
      const shell =
        tankopediaEphemeral.customShell ?? Duel.state.antagonist.shell;

      material.uniforms.penetration.value = shell.penetration.near;
      material.uniforms.caliber.value = shell.caliber;
      material.uniforms.ricochet.value = degToRad(
        isExplosive(shell.type) ? 90 : shell.ricochet!
      );
      material.uniforms.normalization.value = degToRad(
        shell.normalization ?? 0
      );
    }
    function handleProtagonistEquipmentChange(equipment: EquipmentMatrix) {
      const hasEnhancedArmor = hasEquipment(
        110,
        Duel.state.protagonist.tank.equipment_preset,
        equipment
      );
      material.uniforms.thickness.value = hasEnhancedArmor
        ? thickness * 1.03
        : thickness;
    }
    function handleAntagonistEquipmentChange(equipment: EquipmentMatrix) {
      const tankopediaEphemeral = Tankopedia.state;
      const shell =
        tankopediaEphemeral.customShell ?? Duel.state.antagonist.shell;
      const penetration = shell.penetration.near;
      const hasCalibratedShells = hasEquipment(
        103,
        Duel.state.antagonist.tank.equipment_preset,
        equipment
      );

      material.uniforms.penetration.value =
        penetration *
        resolvePenetrationCoefficient(hasCalibratedShells, shell.type);
    }

    handleShellChange();
    handleProtagonistEquipmentChange(Duel.state.protagonist.equipmentMatrix);
    handleAntagonistEquipmentChange(Duel.state.antagonist.equipmentMatrix);

    const unsubscribes = [
      Duel.on((state) => state.antagonist.shell, handleShellChange),
      Tankopedia.on((state) => state.customShell, handleShellChange),
      Duel.on(
        (state) => state.protagonist.equipmentMatrix,
        handleProtagonistEquipmentChange
      ),
      Duel.on(
        (state) => state.antagonist.equipmentMatrix,
        handleAntagonistEquipmentChange
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
          return <group {...props} key={`${key}-spaced-sub-spaced-exclude`} />;
        },

        mesh(_, props, key) {
          return (
            <mesh
              {...props}
              key={`${key}-spaced-sub-spaced-exclude`}
              renderOrder={2}
              material={material}
              onClick={() => {}}
              userData={
                {
                  type: ArmorType.Spaced,
                  thickness,
                } satisfies ArmorUserData
              }
            />
          );
        },
      })}

      {jsxTree(node, {
        group(_, props, key) {
          return <group {...props} key={`${key}-spaced-sub-spaced-include`} />;
        },

        mesh(_, props, key) {
          return (
            <mesh
              {...props}
              key={`${key}-spaced-sub-spaced-include`}
              renderOrder={5}
              material={depthWriteMaterial}
            />
          );
        },
      })}
    </>
  );
}
