import { AvatarCard } from "../../../components/AvatarCard";
import { api } from "../../../core/api/dynamic";
import { useAwait } from "../../../hooks/useAwait";
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

function Content({ skeleton }: ContentProps) {
  const { avatars } = useAwait(() => api.avatars(), "avatars");

  return (
    <div className="avatars">
      {avatars.slice(0, 12).map((avatar) => (
        <AvatarCard key={avatar.name} avatar={avatar} />
      ))}
    </div>
  );
}
