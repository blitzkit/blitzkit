import { FontBoldIcon, FontSizeIcon } from "@radix-ui/react-icons";
import { Flex, Slider, Text } from "@radix-ui/themes";
import type { EmbedPreviewControllerProps } from "../../pages/[...locale]/embed/[embed]/_index";
import { EmbedState, type RadixSizeWithout0 } from "../../stores/embedState";
import {
  radixTextWeights,
  type EmbedConfigItemType,
  type EmbedItemType,
} from "../../stores/embedState/constants";
import { ColorControllerRaw } from "./ColorControllerRaw";

export function RichText({ configKey }: EmbedPreviewControllerProps) {
  const state = EmbedState.use(
    (state) =>
      state[configKey] as EmbedConfigItemType<EmbedItemType.RichText>["default"]
  );

  return (
    <Flex direction="column" flexGrow="1" gap="2">
      <Flex gap="2" align="center">
        <ColorControllerRaw
          value={state.color}
          onValueChange={(value) => {
            EmbedState.mutate((draft) => {
              (
                draft[
                  configKey
                ] as EmbedConfigItemType<EmbedItemType.RichText>["default"]
              ).color = value;
            });
          }}
        />
      </Flex>

      <Flex align="center" gap="2" py="2">
        <Text size="4" trim="both">
          <FontSizeIcon width="1em" height="1em" />
        </Text>
        <Slider
          variant="classic"
          min={1}
          max={9}
          value={[Number(state.size)]}
          onValueChange={([value]) => {
            EmbedState.mutate((draft) => {
              (
                draft[
                  configKey
                ] as EmbedConfigItemType<EmbedItemType.RichText>["default"]
              ).size = `${value}` as RadixSizeWithout0;
            });
          }}
        />
      </Flex>

      <Flex align="center" gap="2" py="2">
        <Text size="4" trim="both">
          <FontBoldIcon width="1em" height="1em" />
        </Text>
        <Slider
          variant="classic"
          min={0}
          max={radixTextWeights.length - 1}
          value={[radixTextWeights.indexOf(state.weight)]}
          onValueChange={([value]) => {
            EmbedState.mutate((draft) => {
              (
                draft[
                  configKey
                ] as EmbedConfigItemType<EmbedItemType.RichText>["default"]
              ).weight = radixTextWeights[value];
            });
          }}
        />
      </Flex>
    </Flex>
  );
}
