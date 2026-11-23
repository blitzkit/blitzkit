import { Soapstone } from "soapstone";
import type { Color } from "../../ui/color";
import type {
  Radius,
  Space,
  SpaceWithout0,
  Weight,
} from "../../types/styles";
import {
  type EmbedConfigItemType,
  EmbedItemType,
  grays,
} from "./constants";

export type ColorCompound = {
  base: Color;
  variant: ColorVariant;
};
export type TextColor =
  | Exclude<Color, Gray>
  | "gray"
  | undefined;
export type ColorStep = `${
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12}`;
export type ColorVariant = `${"" | "a"}${ColorStep}`;
export type Gray = (typeof grays)[number];

export type ExtractEmbedConfigTypes<Config extends EmbedConfig> = {
  [Key in keyof Config]: ({
    type: Config[Key]["type"];
  } & EmbedConfigItem)["default"];
};

export type EmbedConfig = {
  width: EmbedConfigItemType<EmbedItemType.Slider>;
  height: EmbedConfigItemType<EmbedItemType.Slider>;
} & Record<string, EmbedConfigItem>;

export type EmbedConfigItem = (
  | {
      type: EmbedItemType.Slider;
      default: number;
      min: number;
      max: number;
    }
  | {
      type: EmbedItemType.Boolean;
      default: boolean;
    }
  | {
      type: EmbedItemType.String;
      default: string;
    }
  | {
      type: EmbedItemType.Radius;
      default: Radius;
    }
  | {
      type: EmbedItemType.Size;
      default: Space;
    }
  | {
      type: EmbedItemType.SizeWithout0;
      default: SpaceWithout0;
    }
  | {
      type: EmbedItemType.Color;
      default: string;
    }
  | {
      type: EmbedItemType.RichText;
      default: {
        color: string;
        size: SpaceWithout0;
        weight: Weight;
      };
    }
  | {
      type: EmbedItemType.Enum;
      default: string;
      options: {
        value: string;
        locales: Record<string, string>;
      }[];
    }
) & {
  pad?: boolean;
};

export type EmbedStateStore = Record<string, EmbedConfigItem["default"]>;

export const EmbedState = new Soapstone<EmbedStateStore, EmbedStateStore>(
  (data) => data
);
