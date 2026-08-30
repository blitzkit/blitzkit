import { createDynamicAPI } from "@blitzkit/core";
import { vfs } from "./vfs";

export const api = await createDynamicAPI(vfs);
