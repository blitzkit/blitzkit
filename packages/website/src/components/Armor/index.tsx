import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { memo, useState } from "react";
import { DepthTexture, Scene, Vector2 } from "three";
import { PrimaryArmorScene } from "./components/PrimaryArmorScene";
import { spacedArmorRenderTarget } from "./components/PrimaryArmorSceneComponent/target";
import { SpacedArmorScene } from "./components/SpacedArmorScene";

export const Armor = memo(() => {
  const rootScene = useThree((state) => state.scene);
  const [spacedArmorScene] = useState(() => new Scene());
  const [primaryArmorScene] = useState(() => {
    const primaryArmorScene = new Scene();
    primaryArmorScene.fog = rootScene.fog;

    return primaryArmorScene;
  });
  const spacedArmorPortal = createPortal(
    <SpacedArmorScene scene={spacedArmorScene} />,
    spacedArmorScene,
  );
  const primaryArmorPortal = createPortal(
    <PrimaryArmorScene />,
    primaryArmorScene,
  );

  const renderSize = new Vector2();
  const newRenderSize = new Vector2();

  useFrame(({ gl, camera, scene }) => {
    gl.autoClear = true;

    gl.getSize(newRenderSize).multiplyScalar(gl.getPixelRatio());

    if (!newRenderSize.equals(renderSize)) {
      renderSize.copy(newRenderSize);
      spacedArmorRenderTarget.depthTexture = new DepthTexture(
        renderSize.x,
        renderSize.y,
      );
    }

    spacedArmorRenderTarget.setSize(renderSize.x, renderSize.y);
    gl.setRenderTarget(spacedArmorRenderTarget);
    gl.render(spacedArmorScene, camera);

    gl.autoClear = false;

    gl.setRenderTarget(null);
    gl.render(scene, camera);

    gl.clearDepth();
    gl.render(primaryArmorScene, camera);
  }, 1);

  return (
    <>
      {spacedArmorPortal}
      {primaryArmorPortal}
    </>
  );
});
