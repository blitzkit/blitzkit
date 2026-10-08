import { alias } from "@blitzkit/core";
import { useEffect, useState } from "react";
import type { Group, Material } from "three";
import { GLTFLoader } from "three-stdlib";
import { Tankopedia } from "../stores/tankopedia";

interface Skin {
  scene: Group;
  materials: Map<string, Material>;
}

const skins = new Map<string, Promise<Skin>>();

async function loadSkin(path: string) {
  const gltf = await new GLTFLoader().loadAsync(path);
  const materials: Material[] = await gltf.parser.getDependencies("material");

  return {
    scene: gltf.scene,
    materials: new Map(materials.map((material) => [material.name, material])),
  };
}

export function useSkin(id: number, skin?: number) {
  const [loaded, setLoaded] = useState<Skin>();

  useEffect(() => {
    if (skin === undefined) {
      setLoaded(undefined);
      Tankopedia.mutate((draft) => {
        draft.skinLoading = false;
      });
      return;
    }

    const path = alias("api", `/tanks/${id}/skins/${skin}.glb`);
    let cancelled = false;

    Tankopedia.mutate((draft) => {
      draft.skinLoading = true;
    });

    if (!skins.has(path)) skins.set(path, loadSkin(path));

    skins.get(path)!.then((loaded) => {
      if (cancelled) return;

      setLoaded(loaded);
      Tankopedia.mutate((draft) => {
        draft.skinLoading = false;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [id, skin]);

  return loaded;
}
