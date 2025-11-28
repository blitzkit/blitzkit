import type { Tanks } from "../../protos/tanks";

export abstract class AbstractAPI {
  abstract tanks(): Promise<Tanks>;
}
