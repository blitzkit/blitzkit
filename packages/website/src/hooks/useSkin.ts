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
export function useSkin(id: number, loader: "skin" | "attachment" = "skin") {
  const requested = Tankopedia.use((state) => state.loaders[loader].requested);
  const loaded = Tankopedia.use((state) => state.loaders[loader].loaded);

  useEffect(() => {
    if (requested === Tankopedia.state.loaders[loader].loaded) return;

    const path = requested === undefined ? undefined : skinPath(id, requested);
    const cached = path === undefined || loadedSkins.has(path);
    let settled = false;

    if (!cached) {
      Tankopedia.mutate((draft) => {
        draft.revealed = false;
      });

      if (!skins.has(path)) skins.set(path, loadSkin(path));
    }

    // swaps halfway through the lighting transition
    Promise.all([
      path && skins.get(path),
      new Promise((resolve) =>
        setTimeout(resolve, TRANSITION_ANIMATION_TIME * 1e3),
      ),
    ]).then(() => {
      if (settled) return;

      settled = true;
      Tankopedia.mutate((draft) => {
        draft.loaders[loader].loaded = requested;
        if (!cached) draft.revealed = true;
      });
    });

    return () => {
      if (settled) return;

      settled = true;

      if (cached) return;

      Tankopedia.mutate((draft) => {
        draft.revealed = true;
      });
    };
  }, [id, loader, requested]);

  return loaded === undefined
    ? undefined
    : loadedSkins.get(skinPath(id, loaded));
}
