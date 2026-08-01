import { Box, Flex, Link, Text } from "@radix-ui/themes";
import { PreviewWrapper } from "../../../components/Embeds/PreviewWrapper";
import { LinkI18n } from "../../../components/LinkI18n";
import { PageWrapper } from "../../../components/PageWrapper";
import { embedConfigurations } from "../../../constants/embeds";
import { Var } from "../../../core/radix/var";
import {
  type LocaleAcceptorProps,
  LocaleProvider,
  useLocale,
} from "../../../hooks/useLocale";

export function Page({ locale }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content />
    </LocaleProvider>
  );
}

function Content() {
  const { locale, strings } = useLocale();

  return (
    <PageWrapper color="red">
      <Text align="center" mt="3">
        {strings.website.tools.embed.coming_soon}{" "}
        <Link
          underline="always"
          href="https://discord.gg/nDt7AjGJQH"
          target="_blank"
        >
          {strings.website.tools.embed.suggest}
        </Link>
      </Text>

      <Flex justify="center">
        {Object.keys(embedConfigurations).map((embed) => (
          <LinkI18n
            locale={locale}
            href={`/embed/${embed}`}
            color="gray"
            highContrast
            style={{
              width: "fit-content",
              height: "fit-content",
            }}
            underline="hover"
          >
            <Flex
              direction="column"
              overflow="hidden"
              style={{
                borderRadius: Var("radius-4"),
                backgroundColor: Var("color-panel-solid"),
                boxShadow: Var("shadow-3"),
              }}
            >
              <Flex justify="center" p="2">
                <Text>
                  {
                    strings.website.tools.embed.types[
                      embed as keyof typeof strings.website.tools.embed.types
                    ].name
                  }
                </Text>
              </Flex>

              <Box
                width="20rem"
                height="20rem"
                overflow="hidden"
                position="relative"
                style={{
                  backgroundImage:
                    "url(/assets/images/backgrounds/embed-default.webp)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <PreviewWrapper
                  naked
                  name={embed as keyof typeof embedConfigurations}
                />
              </Box>
            </Flex>
          </LinkI18n>
        ))}
      </Flex>
    </PageWrapper>
  );
}
