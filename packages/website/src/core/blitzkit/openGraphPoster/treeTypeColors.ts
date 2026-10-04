import { TankType } from "@blitzkit/core";

/**
 * Same accent mapping tankopedia uses for tank names by tree type (see
 * TankCard/index.tsx and TankSearch/components/FilterControl.tsx: gray
 * researchable, amber premium, blue collector), resolved to literal hex
 * values since satori can't read CSS custom properties or resolve Radix's
 * <Text color/highContrast> at render time. Values are @radix-ui/colors'
 * dark-theme steps: mauveDark.mauve12 (the "gray" family this theme uses,
 * highContrast), amberDark.amber11, blueDark.blue11 - matching the site's
 * `appearance="dark"` theme in BlitzKitTheme/index.tsx.
 */
export const TREE_TYPE_ACCENT_COLORS: Record<TankType, string> = {
  [TankType.TANK_TYPE_RESEARCHABLE]: "#eeeef0",
  [TankType.TANK_TYPE_PREMIUM]: "#ffca16",
  [TankType.TANK_TYPE_COLLECTOR]: "#70b8ff",
};
