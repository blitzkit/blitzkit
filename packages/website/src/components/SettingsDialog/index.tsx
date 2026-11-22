import type { ReactNode } from "react";
import type { LocaleOption } from "../../core/i18n/getLocaleOptions";
import { withLocale } from "../../hocs/withLocale";
import { useStrings } from "../../hooks/useStrings";
import { App } from "../../stores/app";
import { Dialog } from "../Dialog";
import { LocaleSelect } from "../LocaleSelect";
import { Switch } from "../Switch";
import { Text } from "../Text";
import styles from "./index.module.css";

interface SettingsDialogProps {
  children: ReactNode;
  localeOptions: LocaleOption[];
}

export const SettingsDialog = withLocale(
  ({ children, localeOptions }: SettingsDialogProps) => {
    const strings = useStrings();
    const developerMode = App.useDeferred(
      (state) => state.developerMode,
      false,
    );
    const autoLoadModels = App.useDeferred(
      (state) => state.autoLoadModels,
      true,
    );

    return (
      <Dialog.Root>
        <Dialog.Trigger className={styles.trigger}>{children}</Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay />

          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{strings.navbar.settings}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <div className={styles.row}>
                <Text>{strings.settings.language}</Text>
                <LocaleSelect options={localeOptions} />
              </div>

              <div className={styles.row}>
                <Text>{strings.settings.auto_load_models}</Text>
                <Switch
                  checked={autoLoadModels}
                  onCheckedChange={(checked) => {
                    App.mutate((draft) => {
                      draft.autoLoadModels = checked;
                    });
                  }}
                />
              </div>

              <div className={styles.row}>
                <Text>{strings.settings.developer_mode}</Text>
                <Switch
                  checked={developerMode}
                  onCheckedChange={(checked) => {
                    App.mutate((draft) => {
                      draft.developerMode = checked;
                    });
                  }}
                />
              </div>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  },
);
