export const BLITZKIT_TANK_ICON_SIZE = { width: 40 * 16, height: 30 * 16 };

export function tankIcon(id: number, size: "big" | "small" = "big") {
  return `/api/tanks/${id}/icons/${size}.webp`;
}
