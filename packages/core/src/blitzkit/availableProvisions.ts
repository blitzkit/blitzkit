import { GunDefinition, ProvisionDefinitions, TankDefinition } from "../protos";
import { checkConsumableProvisionInclusivity } from "./checkConsumableProvisionInclusivity";

export function availableProvisions(
  tank: TankDefinition,
  gun: GunDefinition,
  provisionDefinitions: ProvisionDefinitions
) {
  return Object.values(provisionDefinitions.provisions).filter((provision) =>
    checkConsumableProvisionInclusivity(provision, tank, gun)
  );
}
