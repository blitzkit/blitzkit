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
    materials: new Map(
      materials
        .filter((material) => material.userData.camouflage)
        .map((material) => [material.name, material]),
    ),
  };

  loadedSkins.set(path, skin);

  return skin;
}

function skinPath(id: number, skin: number) {
  return alias("models_legendary", `/${id}/skins/${skin}.glb`);
}

// attachments load the same way as camouflages and can be shown with one
const slots = {
  skin: { requested: "requestedSkin", loaded: "loadedSkin" },
  attachment: { requested: "requestedAttachment", loaded: "loadedAttachment" },
} as const;

export function useSkin(id: number, slot: keyof typeof slots = "skin") {
  const { requested, loaded } = slots[slot];
  const requestedSkin = Tankopedia.use((state) => state[requested]);
  const skin = Tankopedia.use((state) => state[slot]);

  useEffect(() => {
    const path =
      requestedSkin === undefined ? undefined : skinPath(id, requestedSkin);
    let settled = false;

    if (path === undefined || loadedSkins.has(path)) {
      Tankopedia.mutate((draft) => {
        draft[loaded] = requestedSkin;
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
        draft[loaded] = requestedSkin;
        draft[slot] = requestedSkin;
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
  }, [id, slot, requestedSkin]);

  return skin === undefined ? undefined : loadedSkins.get(skinPath(id, skin));
}
