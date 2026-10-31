import { BlitzEffectScript } from "./blitzEffectScript";

export interface OptionalDevices {
  [key: string]: {
    id: number;
    userString: string;
    description: string;
    icon: string;
    script: BlitzEffectScript;
    display_params: unknown;
  };
}
