import { ClientAPI } from "./client";
import { ServerAPI } from "./server";

let dynamicAPI: AbstractAPI;

if (typeof window === "undefined") {
  dynamicAPI = new ServerAPI();
} else {
  dynamicAPI = new ClientAPI();
}

export const api = dynamicAPI;
