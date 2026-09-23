import type {
  EngineDefinition,
  GunDefinition,
  ShellDefinition,
  TankDefinition,
  TrackDefinition,
  TurretDefinition,
} from "@blitzkit/protos";
import { api } from "../api/dynamic";
import { Tankopedia } from "../stores/tankopedia";
import type { DuelSide } from "./useEquipment";

export enum DuelModule {
  Tank,
  Track,
  Engine,
  Turret,
  Gun,
  Shell,
}

const tanks = await api.tanks();

export function useDuel(
  side: DuelSide,
  module: DuelModule.Tank,
): TankDefinition;
export function useDuel(
  side: DuelSide,
  module: DuelModule.Track,
): TrackDefinition;
export function useDuel(
  side: DuelSide,
  module: DuelModule.Engine,
): EngineDefinition;
export function useDuel(
  side: DuelSide,
  module: DuelModule.Turret,
): TurretDefinition;
export function useDuel(side: DuelSide, module: DuelModule.Gun): GunDefinition;
export function useDuel(
  side: DuelSide,
  module: DuelModule.Shell,
): ShellDefinition;

export function useDuel(side: DuelSide, module: DuelModule) {
  const tankId = Tankopedia.use((state) => state[side].tank);
  const tank = tanks.tanks[tankId];

  if (module === DuelModule.Tank) return tank;

  if (module === DuelModule.Track) {
    const trackId = Tankopedia.use((state) => state[side].track);
    return tank.tracks.find((track) => track.id === trackId)!;
  }

  if (module === DuelModule.Engine) {
    const engineId = Tankopedia.use((state) => state[side].engine);
    return tank.engines.find((engine) => engine.id === engineId)!;
  }

  const turretId = Tankopedia.use((state) => state[side].turret);
  const turret = tank.turrets.find((turret) => turret.id === turretId)!;

  if (module === DuelModule.Turret) return turret;

  const gunId = Tankopedia.use((state) => state[side].gun);
  const gun = turret.guns.find((gun) => gun.id === gunId)!;

  if (module === DuelModule.Gun) return gun;

  const shellId = Tankopedia.use((state) => state[side].shell);
  return gun.shells.find((shell) => shell.id === shellId)!;
}
