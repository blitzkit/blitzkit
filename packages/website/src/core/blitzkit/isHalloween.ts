export function isHalloween() {
  const data = new Date();
  return data.getMonth() === 9 && data.getDate() === 31;
}
