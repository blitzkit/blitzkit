import { createDynamicAPI } from "@blitzkit/core";

export const api = await createDynamicAPI(() =>
  import("../core/blitzkit/vfs").then(({ vfs }) => vfs),
);
