import { Varuna } from "varuna";

interface Tankopedia {
  stage: number;
}

export const Tankopedia = new Varuna<Tankopedia>({ stage: 0 });
