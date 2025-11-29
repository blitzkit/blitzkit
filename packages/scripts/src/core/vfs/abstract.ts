export abstract class AbstractVFS {
  abstract init(): Promise<AbstractVFS>;
}
