import { assertSecret } from "./assertSecret";

export function staticAsset(path: string) {
  return `${assertSecret(import.meta.env.PUBLIC_STATIC_ASSET_BASE)}/${path}`;
}
