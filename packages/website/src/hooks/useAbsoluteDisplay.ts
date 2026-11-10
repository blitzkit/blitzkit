import { Tankopedia } from "../stores/tankopedia";
import type { TankopediaDisplay } from "../stores/tankopediaPersistent/constants";

/** True iff both the loaded and the requested display are `display` */
export function useAbsoluteDisplay(display: TankopediaDisplay) {
  return Tankopedia.use(
    (state) =>
      state.loaders.display.loaded === display &&
      state.loaders.display.requested === display,
  );
}
