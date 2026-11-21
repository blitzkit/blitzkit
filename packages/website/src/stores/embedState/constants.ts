import type { EmbedConfigItem } from ".";

export enum EmbedItemType {
  Radius,
  Size,
  SizeWithout0,
  Color,
  String,
  RichText,
  Boolean,
  Slider,
  Enum,
}

export const grays = [
  "gray",
  "mauve",
  "slate",
  "sage",
  "olive",
  "sand",
] as const;

export type EmbedConfigItemType<Type extends EmbedItemType> =
  EmbedConfigItem & { type: Type };
