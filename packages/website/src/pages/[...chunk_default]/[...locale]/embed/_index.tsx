import { PreviewWrapper } from "../../../../components/Embeds/PreviewWrapper";
import { Link } from "../../../../components/Link";
import { LinkI18n } from "../../../../components/LinkI18n";
import { Text } from "../../../../components/Text";
import { discordLink } from "../../../../config/socials";
import { embedConfigurations } from "../../../../constants/embeds";
import {
  type LocaleAcceptorProps,
  LocaleProvider,
  useLocale,
} from "../../../../hooks/useLocale";
import { useStrings } from "../../../../hooks/useStrings";
import styles from "./_index.module.css";

export function Page({ locale }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content />
    </LocaleProvider>
  );
}

function Content() {
  const locale = useLocale();
  const strings = useStrings();

  return (
    <div className={styles.content}>
      <Text align="center" className={styles.intro}>
        {strings.embed.coming_soon}{" "}
        <Link href={discordLink} target="_blank">
          {strings.embed.suggest}
        </Link>
      </Text>

      <div className={styles.embeds}>
        {Object.keys(embedConfigurations).map((embed) => (
          <LinkI18n
            key={embed}
            locale={locale}
            href={`/embed/${embed}`}
            color="gray"
            highContrast
            underline="hover"
            className={styles.embed}
          >
            <div className={styles.card}>
              <div className={styles.title}>
                <Text>
                  {
                    strings.embed.types[
                      embed as keyof typeof strings.embed.types
                    ].name
                  }
                </Text>
              </div>

              <div className={styles.preview}>
                <PreviewWrapper
                  naked
                  name={embed as keyof typeof embedConfigurations}
                />
              </div>
            </div>
          </LinkI18n>
        ))}
      </div>
    </div>
  );
}
