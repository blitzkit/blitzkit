import { alias } from "@blitzkit/core";
import { useEffect } from "react";
import {
  AnimationMixer,
  Mesh,
  SkinnedMesh,
  type Group,
  type Material,
  type Object3D,
} from "three";
import { GLTFLoader } from "three-stdlib";
import { TRANSITION_ANIMATION_TIME } from "../components/Tankopedia/HeroSection/components/TankSandbox/components/Lighting";
import { prepareMaterial } from "../core/blitzkit/jsxTree";
import { nameOf } from "../core/blitzkit/skinTree";
import { Tankopedia } from "../stores/tankopedia";

export interface Skin {
  scene: Group;
  materials: Map<string, Material>;
  /** customization parts by the tank node they attach to */
  parts: Map<string, Object3D[]>;
  mixer?: AnimationMixer;
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
    // taken now because rendering moves the parts out of the scene
    parts: new Map(
      gltf.scene.children.map((target) => [target.name, [...target.children]]),
    ),
    mixer:
      gltf.animations.length > 0 ? new AnimationMixer(gltf.scene) : undefined,
  };

  // bound now for the same reason, every exported clip loops in the garage
  for (const clip of gltf.animations) skin.mixer!.clipAction(clip).play();

  for (const parts of skin.parts.values()) {
    for (const part of parts) preparePart(part, gltf.scene.userData.states);
  }

  loadedSkins.set(path, skin);

  return skin;
}

// parts render as they are, so what jsxTree and skinTree would do happens here
function preparePart(part: Object3D, states: Record<string, string | null>) {
  part.traverse((object) => {
    if (object.userData.state !== undefined) {
      const name = nameOf(object);
      const state = name in states ? states[name] : object.userData.state;

      for (const child of object.children) {
        child.visible = nameOf(child) === state;
      }
    }

    if (!(object instanceof Mesh)) return;

    object.castShadow = true;
    object.receiveShadow = true;
    // bounds are from the bind pose
    if (object instanceof SkinnedMesh) object.frustumCulled = false;

    prepareMaterial(object.material);
  });
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
