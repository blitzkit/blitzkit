import { Varuna } from "varuna";

interface Maps {
  id: number;
  disturbed: boolean;
  revealed: boolean;
  extent?: number;
}

export const Maps = new Varuna<Maps, number>((id) => ({
  id,
  disturbed: false,
  revealed: false,
}));
