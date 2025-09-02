import { DEFAULT_LOCALE } from "@blitzkit/i18n";
import { Flex, Switch, Text } from "@radix-ui/themes";
import { LocaleSwitcher } from "../../../components/LocaleSwitcher";
import { PageWrapper } from "../../../components/PageWrapper";
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from "../../../hooks/useLocale";
import { App } from "../../../stores/app";

export function Page({ locale = DEFAULT_LOCALE }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content locale={locale} />
    </LocaleProvider>
  );
}

function Content({ locale }: LocaleAcceptorProps) {
  const developerMode = App.useDeferred((state) => state.developerMode, false);
  const { strings } = useLocale();

  return (
    <PageWrapper justify="center" align="center">
      <Flex gap="3" direction="column" width="100%" maxWidth="20rem">
        <Flex align="center" gap="2" justify="between">
          <Text>{strings.website.settings.dev_mode}</Text>
          <Switch
            variant="classic"
            checked={developerMode}
            onCheckedChange={(checked) =>
              App.mutate((draft) => {
                draft.developerMode = checked;
              })
            }
          />
        </Flex>

        <Flex align="center" gap="2" justify="between">
          <Text>{strings.website.settings.language}</Text>
          <LocaleSwitcher locale={locale} />
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
