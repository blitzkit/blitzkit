import {
  GunDefinition,
  ProvisionDefinitions,
  TankDefinition,
} from "../../../protos/src/blitzkit";
import { isTankCompatible } from "../tankopedia";

export function availableProvisions(
  tank: TankDefinition,
  gun: GunDefinition,
  provisionDefinitions: ProvisionDefinitions,
) {
  return Object.values(provisionDefinitions.provisions).filter((provision) =>
    isTankCompatible(tank, gun, provision.include, provision.exclude),
  );
}
