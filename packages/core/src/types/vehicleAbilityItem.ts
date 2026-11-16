import type { AbilitySource } from "@blitzkit/protos";

// A hidden provision or consumable the game marks as a vehicle ability.
// `vehicleNames` is its filter's list of tanks, when it has one
export interface VehicleAbilityItem {
  source: AbilitySource;
  id: number;
  vehicleNames?: string[];
  // The placeholder gun the ability fires, as `nation:gun`
  gun?: string;
}
