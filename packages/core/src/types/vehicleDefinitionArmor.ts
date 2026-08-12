export type VehicleDefinitionArmor = Record<
  string,
  number | { vehicleDamageFactor: 0; "#text": number } | number[]
>;
