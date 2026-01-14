import { useMemo } from "react";
import { AvatarCard } from "../../../components/AvatarCard";
import { IncrementalLoader } from "../../../components/IncrementalLoader";
import { api } from "../../../core/api/dynamic";
import { useAwait } from "../../../hooks/useAwait";
import { useGameStrings } from "../../../hooks/useGameStrings";
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
  const profileAvatarEntityStrings = useGameStrings("ProfileAvatarEntity");
  const ordered = useMemo(
    () =>
      avatars.sort((a, b) => {
        const nameA =
          profileAvatarEntityStrings[a.stuff_ui!.display_name] ??
          a.stuff_ui!.display_name;
        const nameB =
          profileAvatarEntityStrings[b.stuff_ui!.display_name] ??
          b.stuff_ui!.display_name;

        return nameA.localeCompare(nameB);
      }),
    []
  );

  return (
    <div className="avatars">
      <IncrementalLoader
        initial={20}
        skeleton={6}
        data={ordered}
        Component={AvatarCard}
      />
    </div>
  );
}
