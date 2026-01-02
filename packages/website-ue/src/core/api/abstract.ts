import type { CatalogItemAccessor } from "@blitzkit/closed";
import type { Tank } from "../../protos/tank";
import type { TankList } from "../../protos/tank_list";
import type { Tanks } from "../../protos/tanks";

export abstract class AbstractAPI {
  abstract tanks(): Promise<Tanks>;

  abstract tankList(): Promise<TankList>;

  abstract strings(
    locale: string,
    prefix?: string
  ): Promise<Record<string, string>>;

  abstract tank(id: string): Promise<Tank>;

  abstract avatars(): Promise<CatalogItemAccessor[]>;
}
