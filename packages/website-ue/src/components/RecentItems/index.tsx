import { LocaleProvider } from "../../hooks/useLocale";
import { useStrings } from "../../hooks/useStrings";
import { Heading } from "../Heading";
import { Section } from "../Section";
import { Text } from "../Text";
import styles from "./index.module.css";

interface Props {
  locale: string;
  skeleton?: boolean;
}

export function RecentItems({ locale, skeleton }: Props) {
  return (
    <LocaleProvider locale={locale}>
      <Content />
    </LocaleProvider>
  );
}

function Content() {
  const strings = useStrings();
  return (
    <Section first className={styles.recent}>
      <Heading size="3">{strings.recent.title}</Heading>

      <div className={styles.list}>
        <Text lowContrast size="minor">
          {strings.recent.no_recent}
        </Text>
      </div>
    </Section>
  );
}
