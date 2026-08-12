export function assertSecret(secret?: string) {
  if (secret === undefined) throw new Error("Missing secret");
  return secret;
}
