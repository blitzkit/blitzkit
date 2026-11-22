import { CaretDownIcon, DotFilledIcon, GlobeIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { getBestLocale } from "../../core/i18n/getBestLocale";
import type { LocaleOption } from "../../core/i18n/getLocaleOptions";
import { navigateToLocale } from "../../core/i18n/navigateToLocale";
import { useLocale } from "../../hooks/useLocale";
import { useStrings } from "../../hooks/useStrings";
import { Select } from "../Select";

export interface LocaleSelectProps {
  options: LocaleOption[];
}

export function LocaleSelect({ options }: LocaleSelectProps) {
  const locale = useLocale();
  const strings = useStrings();
  const [value] = useState(
    () =>
      `${localStorage.getItem("preferred-locale") === null ? null : locale}`,
  );

  return (
    <Select.Root
      value={value}
      onValueChange={(value) => {
        if (value === "null") {
          localStorage.removeItem("preferred-locale");
          navigateToLocale(getBestLocale());
        } else {
          localStorage.setItem("preferred-locale", value);
          navigateToLocale(value);
        }
      }}
    >
      <Select.Trigger>
        <Select.Value />

        <Select.Icon>
          <CaretDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content>
          <Select.Viewport>
            <Select.Item value="null">
              <Select.ItemIndicator>
                <DotFilledIcon />
              </Select.ItemIndicator>

              <Select.ItemText>
                {strings.settings.device_language}
                <GlobeIcon />
              </Select.ItemText>
            </Select.Item>

            <Select.Separator />

            {options.map(({ locale, flag, name }) => (
              <Select.Item key={locale} value={locale}>
                <Select.ItemIndicator>
                  <DotFilledIcon />
                </Select.ItemIndicator>

                <Select.ItemText>
                  {name}
                  <Select.Discriminator>{flag}</Select.Discriminator>
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
