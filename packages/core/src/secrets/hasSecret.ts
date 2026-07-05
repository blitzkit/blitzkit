import { PassableSecretName } from "./secret";

export function hasSecret(name: PassableSecretName) {
  return name in import.meta.env;
}
