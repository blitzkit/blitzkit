import * as radixColors from "@radix-ui/colors";
import { Varuna } from "varuna";
import {
  type EmbedConfigItemType,
  EmbedItemType,
  radixGrays,
  radixTextWeights,
} from "./constants";

export type RadixSize = `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;
export type RadixSizeWithout0 = Exclude<RadixSize, "0">;
export type RadixRadius = `${1 | 2 | 3 | 4}` | "full";
export type RadixTextWeight = (typeof radixTextWeights)[number];
export type RadixColorCompound = {
  base: RadixColor;
  variant: RadixColorVariant;
};
export type RadixTextColor =
  | Exclude<RadixColor, RadixColorGrays>
  | "gray"
  | undefined;
export type RadixColorVariantRaw = `${
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
export type RadixColorVariant = `${"" | "a"}${RadixColorVariantRaw}`;
export type RadixColor = Exclude<
  keyof typeof radixColors,
  `${string}${"A" | "P3" | "Dark"}`
>;
export type RadixColorGrays = (typeof radixGrays)[number];

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
      default: RadixRadius;
    }
  | {
      type: EmbedItemType.Size;
      default: RadixSize;
    }
  | {
      type: EmbedItemType.SizeWithout0;
      default: RadixSizeWithout0;
    }
  | {
      type: EmbedItemType.Color;
      default: string;
    }
  | {
      type: EmbedItemType.RichText;
      default: {
        color: string;
        size: RadixSizeWithout0;
        weight: RadixTextWeight;
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

export const EmbedState = new Varuna<EmbedStateStore, EmbedStateStore>(
  (data) => data
);
