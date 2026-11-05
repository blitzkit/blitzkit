export function assertSecret(secret?: string) {
  if (!secret) {
    throw new Error("Secret is not defined");
  }

  return secret;
}
