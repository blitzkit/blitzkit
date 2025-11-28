import type { Tanks } from "../../protos/tanks";

export abstract class AbstractAPI {
  abstract tanks(): Promise<Tanks>;

  abstract strings(
    locale: string,
    prefix?: string
  ): Promise<Record<string, string>>;
}
