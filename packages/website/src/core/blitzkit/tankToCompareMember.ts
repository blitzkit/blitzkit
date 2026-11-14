import type { TankDefinition } from "@blitzkit/protos";
import { uniqueId } from "lodash-es";
import type { CompareMember } from "../../stores/compareEphemeral";
import { createTankState } from "../../tankopedia/createTankState";

export function tankToCompareMember(tank: TankDefinition) {
  return {
    key: uniqueId(),
    state: createTankState(tank),
  } satisfies CompareMember;
}
