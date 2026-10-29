import { fetchTankNames } from "@blitzkit/core";
import { api } from "../../api/dynamic";

export const awaitableTankNames = fetchTankNames(api);
