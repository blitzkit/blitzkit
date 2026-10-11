import {
  canSplash,
  isExplosive,
  resolvePenetrationCoefficient,
} from "@blitzkit/core";
import { invalidate, useFrame } from "@react-three/fiber";
import type { QuicklimeEvent } from "quicklime";
import { useEffect, useRef } from "react";
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
import { jsxTree } from "../../core/blitzkit/jsxTree";
import { DuelModule, getDuel } from "../../hooks/useDuel";
import { hasEquipment } from "../../hooks/useEquipment";
import { Tankopedia } from "../../stores/tankopedia";
import { TankopediaPersistent } from "../../stores/tankopediaPersistent";
import { transitionEvent } from "../Lighting";
import { spacedArmorRenderTarget } from "../PrimaryArmorRenderTarget";
import fragmentShader from "./shaders/fragment.glsl?raw";
import vertexShader from "./shaders/vertex.glsl?raw";

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
  const material = useRef(
    new ShaderMaterial({
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

          opacity: { value: 0 },
        },
      ]),
    }),
  );

  useEffect(() => {
    function handleShellChange() {
      const shell =
        Tankopedia.state.customShell ?? getDuel("antagonist", DuelModule.Shell);

      material.current.uniforms.caliber.value = shell.caliber;
      material.current.uniforms.ricochet.value = degToRad(
        isExplosive(shell.type) ? 90 : shell.ricochet!,
      );
      material.current.uniforms.normalization.value = degToRad(
        shell.normalization ?? 0,
      );
      material.current.uniforms.isExplosive.value = isExplosive(shell.type);
      material.current.uniforms.canSplash.value = canSplash(shell.type);
      material.current.uniforms.damage.value = shell.armor_damage;
      material.current.uniforms.explosionRadius.value = shell.explosion_radius;

      handleProtagonistEquipmentChange(true);
      handleAntagonistEquipmentChange(true);

      invalidate();
    }
    function handleGreenPenetrationChange(greenPenetration: boolean) {
      material.current.uniforms.greenPenetration.value = greenPenetration;
    }
    function handleAdvancedHighlightingChange(advancedHighlighting: boolean) {
      material.current.uniforms.advancedHighlighting.value =
        advancedHighlighting;
      invalidate();
    }
    function handleOpaqueChange(opaque: boolean) {
      material.current.uniforms.opaque.value = opaque;
    }
    function handleWireframeChange(wireframe: boolean) {
      material.current.wireframe = wireframe;
    }
    function handleProtagonistEquipmentChange(noInvalidate = false) {
      const equipment = Tankopedia.state.protagonist.equipment;
      const protagonist = getDuel("protagonist", DuelModule.Tank);
      const hasEnhancedArmor = hasEquipment(
        110,
        protagonist.equipment_preset,
        equipment,
      );
      const equalizer =
        (Tankopedia.state.equalize
          ? protagonist.equalizer?.armor
          : undefined) ?? 1;

      material.current.uniforms.thickness.value =
        thickness * (hasEnhancedArmor ? 1.04 : 1) * equalizer;

      if (!noInvalidate) invalidate();
    }
    function handleAntagonistEquipmentChange(noInvalidate = false) {
      const antagonist = getDuel("antagonist", DuelModule.Tank);

      const equipment = Tankopedia.state.antagonist.equipment;
      const tankopediaEphemeral = Tankopedia.state;
      const shell =
        tankopediaEphemeral.customShell ??
        getDuel("antagonist", DuelModule.Shell);
      const penetration = shell.penetration!.near;
      const hasCalibratedShells = hasEquipment(
        103,
        antagonist.equipment_preset,
        equipment,
      );

      material.current.uniforms.penetration.value =
        penetration *
        resolvePenetrationCoefficient(
          hasCalibratedShells,
          Tankopedia.state.equalize,
          shell.type,
          antagonist.equalizer,
        );

      if (!noInvalidate) invalidate();
    }

    function handleTransitionEvent(event: QuicklimeEvent<number>) {
      material.current.uniforms.opacity.value = event.data;
    }

    handleShellChange();
    handleGreenPenetrationChange(TankopediaPersistent.state.greenPenetration);
    handleAdvancedHighlightingChange(
      TankopediaPersistent.state.advancedHighlighting,
    );
    handleOpaqueChange(TankopediaPersistent.state.opaque);
    handleWireframeChange(TankopediaPersistent.state.wireframe);
    handleProtagonistEquipmentChange();
    handleAntagonistEquipmentChange();

    transitionEvent.on(handleTransitionEvent);

    const unsubscribes = [
      Tankopedia.on((state) => state.antagonist.shell, handleShellChange),
      Tankopedia.on((state) => state.customShell, handleShellChange),
      TankopediaPersistent.on(
        (state) => state.greenPenetration,
        handleGreenPenetrationChange,
      ),
      TankopediaPersistent.on(
        (state) => state.advancedHighlighting,
        handleAdvancedHighlightingChange,
      ),
      TankopediaPersistent.on((state) => state.opaque, handleOpaqueChange),
      Tankopedia.on(
        (state) => state.protagonist.equipment,
        () => handleProtagonistEquipmentChange(),
      ),
      Tankopedia.on(
        (state) => state.antagonist.equipment,
        () => handleAntagonistEquipmentChange(),
      ),
      Tankopedia.on(
        (state) => state.equalize,
        () => {
          handleProtagonistEquipmentChange();
          handleAntagonistEquipmentChange();
        },
      ),
      () => transitionEvent.off(handleTransitionEvent),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useFrame(({ gl, camera }) => {
    gl.getSize(material.current.uniforms.resolution.value).multiplyScalar(
      gl.getPixelRatio(),
    );
    material.current.uniforms.spacedArmorBuffer.value =
      spacedArmorRenderTarget.texture;
    material.current.uniforms.spacedArmorDepth.value =
      spacedArmorRenderTarget.depthTexture;
    material.current.uniforms.inverseProjectionMatrix.value =
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
              material={material.current}
            />
          );
        },
      })}
    </>
  );
}
