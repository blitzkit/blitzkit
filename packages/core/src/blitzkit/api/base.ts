import { GameDefinitions } from "../../protos";

export abstract class BlitzKitAPI {
  abstract game(): Promise<GameDefinitions>;
}
