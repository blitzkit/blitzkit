import { assertSecret } from "./assertSecret";

export function asset(path: string) {
  return `${assertSecret(import.meta.env.PUBLIC_ASSET_BASE)}/${path}`;
}
