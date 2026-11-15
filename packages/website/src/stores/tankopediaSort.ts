import { Soapstone } from "soapstone";
import type { RenderedCharacteristicName } from "../types/characteristics";
import { TankopediaSortDirection } from "./tankopediaPersistent";

export interface TankSort {
  by: RenderedCharacteristicName | null;
  direction: TankopediaSortDirection;
}

export const TankSort = new Soapstone<TankSort>({
  by: null,
  direction: TankopediaSortDirection.Descending,
});
