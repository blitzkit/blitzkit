import { Soapstone } from "soapstone";

interface Gallery {
  search?: string;
}

export const Gallery = new Soapstone<Gallery>({});
