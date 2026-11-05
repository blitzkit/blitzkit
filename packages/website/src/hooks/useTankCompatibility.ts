import { isTankCompatible } from "@blitzkit/core";
import {
  GunDefinition,
  TankDefinition,
  TankInclusivityFilter,
} from "@blitzkit/protos";

export function useTankCompatibility(tank: TankDefinition, gun: GunDefinition) {
  return function (
    include?: TankInclusivityFilter[],
    exclude?: TankInclusivityFilter[],
  ) {
    return isTankCompatible(tank, gun, include, exclude);
  };
}
