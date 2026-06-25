import { hasSecret } from "./hasSecret";
import { WellKnownSecret } from "./wellKnown";

export enum SecretType {
  String,
  Number,
}

export type PassableSecretName = WellKnownSecret | (string & {});

export function secret(
  name: PassableSecretName,
  type?: SecretType.String,
): string;

export function secret(
  name: PassableSecretName,
  type: SecretType.Number,
): number;

export function secret(
  name: WellKnownSecret | (string & {}),
  type = SecretType.String,
) {
  if (!hasSecret(name)) {
    throw new Error(`Secret "${name}" not defined`);
  }

  const value = import.meta.env[name];

  switch (type) {
    case SecretType.String:
      return value;

    case SecretType.Number:
      return Number(value);
  }
}
