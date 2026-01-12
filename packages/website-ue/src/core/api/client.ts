import { fetchPB } from "@blitzkit/core";
import { Avatars } from "../../protos/avatars";
import { AbstractAPI } from "./abstract";

export class ClientAPI extends AbstractAPI {
  protected _avatars() {
    return fetchPB("/api/avatars/all.pb", Avatars);
  }
}
