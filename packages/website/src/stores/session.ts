import type {
  CompositeStatsKey,
  IndividualTankStats,
  Region,
} from "@blitzkit/core";
import { Soapstone } from "soapstone";

interface SessionBase {
  columns: CompositeStatsKey[];
}

export interface SessionTracking extends SessionBase {
  tracking: true;
  player: {
    id: number;
    region: Region;
    since: number;
    stats: IndividualTankStats[];
  };
}

interface SessionNotTracking extends SessionBase {
  tracking: false;
}

type Session = SessionTracking | SessionNotTracking;

export const Session = new Soapstone<Session>(
  {
    columns: [
      "cumulative_battles",
      "normalized_wins",
      "cumulative_wn8",
      "normalized_damage_dealt",
    ],
    tracking: false,
  },
  "session-4"
);
