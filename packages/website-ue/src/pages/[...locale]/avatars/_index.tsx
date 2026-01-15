import { AvatarControls } from "../../../components/AvatarControls";
import { AvatarsList } from "../../../components/AvatarsList";
import { Section } from "../../../components/Section";
import { LocaleProvider } from "../../../hooks/useLocale";

interface PageProps extends ContentProps {
  locale: string;
}

export function Page({ locale, ...props }: PageProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content {...props} />
    </LocaleProvider>
  );
}

interface ContentProps {
  skeleton?: boolean;
}

function Content({}: ContentProps) {
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
