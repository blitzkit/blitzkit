import { Soapstone } from "soapstone";
import type { CharacteristicName } from "../types/characteristics";
import { TankopediaSortDirection } from "./tankopediaPersistent";

export interface TankSort {
  by: CharacteristicName | null;
  direction: TankopediaSortDirection;
}

export const TankSort = new Soapstone<TankSort>({
  by: null,
  direction: TankopediaSortDirection.Descending,
});
