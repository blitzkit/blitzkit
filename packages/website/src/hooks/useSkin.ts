import { alias } from "@blitzkit/core";
import { useEffect } from "react";
import type { Group, Material } from "three";
import { GLTFLoader } from "three-stdlib";
import { TRANSITION_ANIMATION_TIME } from "../components/Tankopedia/HeroSection/components/TankSandbox/components/Lighting";
import { Tankopedia } from "../stores/tankopedia";

export interface Skin {
  scene: Group;
  materials: Map<string, Material>;
}

const skins = new Map<string, Promise<Skin>>();
const loadedSkins = new Map<string, Skin>();

async function loadSkin(path: string) {
  const gltf = await new GLTFLoader().loadAsync(path);
  const materials: Material[] = await gltf.parser.getDependencies("material");
  const skin = {
    scene: gltf.scene,
    materials: new Map(materials.map((material) => [material.name, material])),
  };

  loadedSkins.set(path, skin);

  return skin;
}

function skinPath(id: number, skin: number) {
  return alias("models_legendary", `/${id}/skins/${skin}.glb`);
}

export function useSkin(id: number) {
  const requestedSkin = Tankopedia.use((state) => state.requestedSkin);
  const skin = Tankopedia.use((state) => state.skin);

  useEffect(() => {
    const path =
      requestedSkin === undefined ? undefined : skinPath(id, requestedSkin);
    let settled = false;

    if (path === undefined || loadedSkins.has(path)) {
      Tankopedia.mutate((draft) => {
        draft.loadedSkin = requestedSkin;
      });
      return;
    }

    Tankopedia.mutate((draft) => {
      draft.revealed = false;
    });

    if (!skins.has(path)) skins.set(path, loadSkin(path));

    Promise.all([
      skins.get(path),
      new Promise((resolve) =>
        setTimeout(resolve, TRANSITION_ANIMATION_TIME * 1e3),
      ),
    ]).then(() => {
      if (settled) return;

      settled = true;
      Tankopedia.mutate((draft) => {
        draft.loadedSkin = requestedSkin;
        draft.skin = requestedSkin;
        draft.revealed = true;
      });
    });

    return () => {
      if (settled) return;

      settled = true;
      Tankopedia.mutate((draft) => {
        draft.revealed = true;
      });
    };
  }, [id, requestedSkin]);

  return skin === undefined ? undefined : loadedSkins.get(skinPath(id, skin));
}
