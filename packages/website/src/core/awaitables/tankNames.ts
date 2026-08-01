import { fetchTankNames } from "@blitzkit/core";
import { api } from "../blitzkit/api";

export const awaitableTankNames = fetchTankNames(api);
