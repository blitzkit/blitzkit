import { Soapstone } from "soapstone";
import type { RenderedCharacteristicName } from "../types/characteristics";
import { SortDirection } from "./tankopediaPersistent";

export interface TankSort {
  by: RenderedCharacteristicName | null;
  direction: SortDirection;
}

export const TankSort = new Soapstone<TankSort>({
  by: null,
  direction: SortDirection.Descending,
});
