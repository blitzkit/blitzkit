import type { Tank } from "../../protos/tank";
import type { Tanks } from "../../protos/tanks";

export abstract class AbstractAPI {
  abstract tanks(): Promise<Tanks>;

  abstract strings(
    locale: string,
    prefix?: string
  ): Promise<Record<string, string>>;

  abstract tank(id: string): Promise<Tank>;
}
