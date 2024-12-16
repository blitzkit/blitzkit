import {
  canSplash,
  isExplosive,
  resolvePenetrationCoefficient,
} from '@blitzkit/core';
import { invalidate, useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import { MeshBasicMaterial, Object3D, ShaderMaterial, Vector2 } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { hasEquipment } from '../../../../core/blitzkit/hasEquipment';
import { jsxTree } from '../../../../core/blitzkit/jsxTree';
import { Duel, type EquipmentMatrix } from '../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../stores/tankopediaPersistent';
import fragmentShader from './shaders/fragment.glsl?raw';
import vertexShader from './shaders/vertex.glsl?raw';
import { spacedArmorRenderTarget } from './target';

interface PrimaryArmorSceneComponentProps {
  thickness: number;
  node: Object3D;
}

const excludeMaterial = new MeshBasicMaterial({
  colorWrite: false,
});

export function PrimaryArmorSceneComponent({
  node,
  thickness,
}: PrimaryArmorSceneComponentProps) {
  const tankopediaPersistentStore = TankopediaPersistent.useStore();
  const duelStore = Duel.useStore();
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();
  const material = new ShaderMaterial({
    fragmentShader,
    vertexShader,

    transparent: true,

    uniforms: {
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
  });

  useEffect(() => {
    async function handleShellChange() {
      const duel = duelStore.getState();
      const tankopediaEphemeral = tankopediaEphemeralStore.getState();
      const shell = tankopediaEphemeral.customShell ?? duel.antagonist.shell;

      material.uniforms.caliber.value = shell.caliber;
      material.uniforms.ricochet.value = degToRad(
        isExplosive(shell.type) ? 90 : shell.ricochet!,
      );
      material.uniforms.normalization.value = degToRad(
        shell.normalization ?? 0,
      );
      material.uniforms.isExplosive.value = isExplosive(shell.type);
      material.uniforms.canSplash.value = canSplash(shell.type);
      material.uniforms.damage.value = shell.armor_damage;
      material.uniforms.explosionRadius.value = shell.explosion_radius;

      await handleProtagonistEquipmentChange(
        duel.protagonist.equipmentMatrix,
        true,
      );
      await handleAntagonistEquipmentChange(
        duel.antagonist.equipmentMatrix,
        true,
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
    async function handleProtagonistEquipmentChange(
      equipment: EquipmentMatrix,
      noInvalidate = false,
    ) {
      const duel = duelStore.getState();
      const hasEnhancedArmor = await hasEquipment(
        110,
        duel.protagonist.tank.equipment_preset,
        equipment,
      );
      material.uniforms.thickness.value = hasEnhancedArmor
        ? thickness * 1.03
        : thickness;

      if (!noInvalidate) invalidate();
    }
    async function handleAntagonistEquipmentChange(
      equipment: EquipmentMatrix,
      noInvalidate = false,
    ) {
      const duel = duelStore.getState();
      const tankopediaEphemeral = tankopediaEphemeralStore.getState();
      const shell = tankopediaEphemeral.customShell ?? duel.antagonist.shell;
      const penetration = shell.penetration.near;
      const hasCalibratedShells = await hasEquipment(
        103,
        duel.antagonist.tank.equipment_preset,
        equipment,
      );

      material.uniforms.penetration.value =
        penetration *
        resolvePenetrationCoefficient(hasCalibratedShells, shell.type);

      if (!noInvalidate) invalidate();
    }

    const initialState = tankopediaPersistentStore.getState();

    handleShellChange();
    handleGreenPenetrationChange(initialState.greenPenetration);
    handleAdvancedHighlightingChange(initialState.advancedHighlighting);
    handleOpaqueChange(initialState.opaque);
    handleWireframeChange(initialState.wireframe);
    handleProtagonistEquipmentChange(
      duelStore.getState().protagonist.equipmentMatrix,
    );
    handleAntagonistEquipmentChange(
      duelStore.getState().antagonist.equipmentMatrix,
    );

    const unsubscribes = [
      duelStore.subscribe((state) => state.antagonist.shell, handleShellChange),
      tankopediaEphemeralStore.subscribe(
        (state) => state.customShell,
        handleShellChange,
      ),
      tankopediaPersistentStore.subscribe(
        (state) => state.greenPenetration,
        handleGreenPenetrationChange,
      ),
      tankopediaPersistentStore.subscribe(
        (state) => state.advancedHighlighting,
        handleAdvancedHighlightingChange,
      ),
      tankopediaPersistentStore.subscribe(
        (state) => state.opaque,
        handleOpaqueChange,
      ),
      duelStore.subscribe(
        (state) => state.protagonist.equipmentMatrix,
        (equipment) => handleProtagonistEquipmentChange(equipment),
      ),
      duelStore.subscribe(
        (state) => state.antagonist.equipmentMatrix,
        (equipment) => handleAntagonistEquipmentChange(equipment),
      ),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  });

  useFrame(({ gl, camera }) => {
    gl.getSize(material.uniforms.resolution.value).multiplyScalar(
      gl.getPixelRatio(),
    );
    material.uniforms.spacedArmorBuffer.value = spacedArmorRenderTarget.texture;
    material.uniforms.spacedArmorDepth.value =
      spacedArmorRenderTarget.depthTexture;
    material.uniforms.inverseProjectionMatrix.value =
      camera.projectionMatrixInverse;
  });

  return (
    <>
      {jsxTree(
        node,
        { mesh: { renderOrder: 0, material: excludeMaterial } },
        `${node.uuid}-exclude`,
      )}
      {jsxTree(
        node,
        { mesh: { renderOrder: 1, material } },
        `${node.uuid}-include`,
      )}
    </>
  );
}
