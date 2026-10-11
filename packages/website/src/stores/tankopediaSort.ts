import { Soapstone } from 'soapstone';
import {
  type TankopediaSortBy,
  type TankopediaSortDirection,
} from './tankopediaPersistent';

export interface TankSort {
  by: TankopediaSortBy;
  direction: TankopediaSortDirection;
}

export const TankSort = new Soapstone<TankSort>({
  by: 'meta.none',
  direction: 'descending',
});
