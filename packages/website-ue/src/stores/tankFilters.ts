import { Varuna } from "varuna";

interface TankFilters {
  search?: string;
}

export const TankFilters = new Varuna<TankFilters>({
  search: undefined,
});
