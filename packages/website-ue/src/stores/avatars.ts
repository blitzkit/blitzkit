import { Varuna } from "varuna";

interface Avatars {
  search: string | null;
}

export const Avatars = new Varuna<Avatars>({
  search: null,
});
