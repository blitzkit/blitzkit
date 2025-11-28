import type { MetadataAccessor } from "@blitzkit/closed";
import type { TanksEntry } from "../../protos/tanks";
import { AbstractAPI } from "./abstract";

export class ServerAPI extends AbstractAPI {
  constructor(private metadata: MetadataAccessor) {
    super();

    console.log(Object.keys(metadata.groups).join("\n"));
  }

  async tanks() {
    const group = this.metadata.group("TankEntity");
    const tanks: TanksEntry[] = [];

    for (const item of group) {
      const tankCatalog = item.TankCatalog();

      const id = item.id;
      const slug = tankCatalog.name?.value;

      tanks.push({ id, slug });
    }

    return { tanks };
  }
}
