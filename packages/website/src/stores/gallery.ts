import { Varuna } from "varuna";

interface Gallery {
  search?: string;
}

export const Gallery = new Varuna<Gallery>({});
