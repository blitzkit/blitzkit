import { BlitzEffectScript } from "./blitzEffectScript";

export interface BlitzScripts {
  consumables: Record<number, BlitzEffectScript>;
  provisions: Record<number, BlitzEffectScript>;
  equipment: Record<number, BlitzEffectScript>;
}
