import { createDynamicAPI } from "@blitzkit/core";

export const api = await createDynamicAPI(() =>
  import("./vfs").then(({ vfs }) => vfs),
);
