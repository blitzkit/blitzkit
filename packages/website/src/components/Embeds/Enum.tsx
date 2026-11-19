import { CaretDownIcon, DotFilledIcon } from "@radix-ui/react-icons";
import { useLocale } from "../../hooks/useLocale";
import type { EmbedPreviewControllerProps } from "../../pages/[...chunk_default]/[...locale]/embed/[embed]/_index";
import { EmbedState } from "../../stores/embedState";
import type {
  EmbedConfigItemType,
  EmbedItemType,
} from "../../stores/embedState/constants";
import { Select } from "../Select";

export function Enum({
  configKey,
  config,
}: EmbedPreviewControllerProps & {
  config: EmbedConfigItemType<EmbedItemType.Enum>;
}) {
  const locale = useLocale();
  const value = EmbedState.use((state) => state[configKey] as string);

  // Passed as children so the label renders before hydration
  const label = config.options.find((option) => option.value === value)!
    .locales[locale];

  return (
    <Select.Root
      value={value}
      onValueChange={(value) => {
        EmbedState.mutate((draft) => {
          draft[configKey] = value;
        });
      }}
    >
      <Select.Trigger>
        <Select.Value>{label}</Select.Value>

        <Select.Icon>
          <CaretDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content>
          <Select.Viewport>
            {config.options.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                <Select.ItemIndicator>
                  <DotFilledIcon />
                </Select.ItemIndicator>

                <Select.ItemText>{option.locales[locale]}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
