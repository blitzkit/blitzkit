import { AvatarControls } from "../../../components/AvatarControls";
import { AvatarsList } from "../../../components/AvatarsList";
import { Section } from "../../../components/Section";
import { LocaleProvider } from "../../../hooks/useLocale";

interface PageProps {
  locale: string;
}

export function Page({ locale, ...props }: PageProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content {...props} />
    </LocaleProvider>
  );
}

function Content() {
  return (
    <>
      <Section>
        <AvatarControls />
      </Section>

      <Section>
        <AvatarsList />
      </Section>
    </>
  );
}
