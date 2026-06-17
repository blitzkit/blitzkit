import type { TankCatalogComponent } from "@protos/blitz_static_tank_component";
import { api } from "../api/dynamic";
import { useAwait } from "./useAwait";

export function useEquipment(tank: TankCatalogComponent) {
  const equipment = useAwait(() => api.equipment(), "equipment");
  const preset = equipment.presets[tank.equipment_preset_catalog_id];
  const price = equipment.prices[tank.equipment_price_preset_catalog_id];

  return { preset, price, equipments: equipment.equipments };
}
