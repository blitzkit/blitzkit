import {
  canSplash,
  isExplosive,
  resolvePenetrationCoefficient,
} from "@blitzkit/core";
import { invalidate, useFrame } from "@react-three/fiber";
import { useEffect } from "react";
import {
  MeshBasicMaterial,
  NormalBlending,
  Object3D,
  ShaderMaterial,
  SubtractiveBlending,
  UniformsLib,
  UniformsUtils,
  Vector2,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { hasEquipment } from "../../../../core/blitzkit/hasEquipment";
import { jsxTree } from "../../../../core/blitzkit/jsxTree";
import { Duel, type EquipmentMatrix } from "../../../../stores/duel";
import { Tankopedia } from "../../../../stores/tankopedia";
import { TankopediaPersistent } from "../../../../stores/tankopediaPersistent";
import fragmentShader from "./shaders/fragment.glsl?raw";
import vertexShader from "./shaders/vertex.glsl?raw";
import { spacedArmorRenderTarget } from "./target";

interface PrimaryArmorSceneComponentProps {
  thickness: number;
  node: Object3D;
}

const excludeMaterial = new MeshBasicMaterial({
  colorWrite: false,
});

const date = new Date();
const isHalloween = date.getMonth() === 9 && date.getDate() === 31;

export function PrimaryArmorSceneComponent({
  node,
  thickness,
}: PrimaryArmorSceneComponentProps) {
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    fog: true,
    transparent: true,

    blending: isHalloween ? SubtractiveBlending : NormalBlending,

    uniforms: UniformsUtils.merge([
      UniformsLib.common,
      UniformsLib.fog,

      {
        thickness: { value: null },
        penetration: { value: null },
        caliber: { value: null },
        ricochet: { value: null },
        normalization: { value: null },
        isExplosive: { value: null },
        canSplash: { value: null },
        damage: { value: null },
        explosionRadius: { value: null },
        greenPenetration: { value: null },
        advancedHighlighting: { value: null },
        opaque: { value: null },

        inverseProjectionMatrix: { value: null },
        resolution: { value: new Vector2() },
        spacedArmorBuffer: { value: null },
        spacedArmorDepth: { value: null },
      },
    ]),
  });

  useEffect(() => {
    function handleShellChange() {
      const tankopediaEphemeral = Tankopedia.state;
      const shell =
        tankopediaEphemeral.customShell ?? Duel.state.antagonist.shell;

      material.uniforms.caliber.value = shell.caliber;
      material.uniforms.ricochet.value = degToRad(
        isExplosive(shell.type) ? 90 : shell.ricochet!
      );
      material.uniforms.normalization.value = degToRad(
        shell.normalization ?? 0
      );
      material.uniforms.isExplosive.value = isExplosive(shell.type);
      material.uniforms.canSplash.value = canSplash(shell.type);
      material.uniforms.damage.value = shell.armor_damage;
      material.uniforms.explosionRadius.value = shell.explosion_radius;

      handleProtagonistEquipmentChange(
        Duel.state.protagonist.equipmentMatrix,
        true
      );
      handleAntagonistEquipmentChange(
        Duel.state.antagonist.equipmentMatrix,
        true
      );

      invalidate();
    }
    function handleGreenPenetrationChange(greenPenetration: boolean) {
      material.uniforms.greenPenetration.value = greenPenetration;
    }
    function handleAdvancedHighlightingChange(advancedHighlighting: boolean) {
      material.uniforms.advancedHighlighting.value = advancedHighlighting;
      invalidate();
    }
    function handleOpaqueChange(opaque: boolean) {
      material.uniforms.opaque.value = opaque;
    }
    function handleWireframeChange(wireframe: boolean) {
      material.wireframe = wireframe;
    }
    function handleProtagonistEquipmentChange(
      equipment: EquipmentMatrix,
      noInvalidate = false
    ) {
      const hasEnhancedArmor = hasEquipment(
        110,
        Duel.state.protagonist.tank.equipment_preset,
        equipment
      );
      material.uniforms.thickness.value = hasEnhancedArmor
        ? thickness * 1.03
        : thickness;

      if (!noInvalidate) invalidate();
    }
    function handleAntagonistEquipmentChange(
      equipment: EquipmentMatrix,
      noInvalidate = false
    ) {
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

      if (!noInvalidate) invalidate();
    }

    handleShellChange();
    handleGreenPenetrationChange(TankopediaPersistent.state.greenPenetration);
    handleAdvancedHighlightingChange(
      TankopediaPersistent.state.advancedHighlighting
    );
    handleOpaqueChange(TankopediaPersistent.state.opaque);
    handleWireframeChange(TankopediaPersistent.state.wireframe);
    handleProtagonistEquipmentChange(Duel.state.protagonist.equipmentMatrix);
    handleAntagonistEquipmentChange(Duel.state.antagonist.equipmentMatrix);

    const unsubscribes = [
      Duel.on((state) => state.antagonist.shell, handleShellChange),
      Tankopedia.on((state) => state.customShell, handleShellChange),
      TankopediaPersistent.on(
        (state) => state.greenPenetration,
        handleGreenPenetrationChange
      ),
      TankopediaPersistent.on(
        (state) => state.advancedHighlighting,
        handleAdvancedHighlightingChange
      ),
      TankopediaPersistent.on((state) => state.opaque, handleOpaqueChange),
      Duel.on(
        (state) => state.protagonist.equipmentMatrix,
        (equipment) => handleProtagonistEquipmentChange(equipment)
      ),
      Duel.on(
        (state) => state.antagonist.equipmentMatrix,
        (equipment) => handleAntagonistEquipmentChange(equipment)
      ),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  });

  useFrame(({ gl, camera }) => {
    gl.getSize(material.uniforms.resolution.value).multiplyScalar(
      gl.getPixelRatio()
    );
    material.uniforms.spacedArmorBuffer.value = spacedArmorRenderTarget.texture;
    material.uniforms.spacedArmorDepth.value =
      spacedArmorRenderTarget.depthTexture;
    material.uniforms.inverseProjectionMatrix.value =
      camera.projectionMatrixInverse;
  });

  return (
    <>
      {jsxTree(node, {
        mesh(_, props, key) {
          return (
            <mesh
              {...props}
              key={`${key}-exclude`}
              renderOrder={0}
              material={excludeMaterial}
            />
          );
        },
      })}
      {jsxTree(node, {
        mesh(_, props, key) {
          return (
            <mesh
              {...props}
              key={`${key}-include`}
              renderOrder={1}
              material={material}
            />
          );
        },
      })}
    </>
  );
}
