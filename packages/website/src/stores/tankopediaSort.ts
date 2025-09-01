import { Varuna } from 'varuna';
import {
  type TankopediaSortBy,
  type TankopediaSortDirection,
} from './tankopediaPersistent';

export interface TankSort {
  by: TankopediaSortBy;
  direction: TankopediaSortDirection;
}

export const TankSort = new Varuna<TankSort>({
  by: 'meta.none',
  direction: 'descending',
});
