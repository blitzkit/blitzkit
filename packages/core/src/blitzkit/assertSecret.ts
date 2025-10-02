export function assertSecret<Type>(secret?: Type) {
  if (secret === undefined) throw new Error("Missing secret");
  return secret;
}
