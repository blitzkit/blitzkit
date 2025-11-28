import type { TankCatalogComponent } from "@protos/blitz_static_tank_component";
import type { Tanks } from "../../protos/tanks";

export abstract class AbstractAPI {
  abstract tanks(): Promise<Tanks>;

  abstract strings(
    locale: string,
    prefix?: string
  ): Promise<Record<string, string>>;

  abstract tank(id: string): Promise<TankCatalogComponent>;
}
