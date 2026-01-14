import { useMemo } from "react";
import { AvatarCard } from "../../../components/AvatarCard";
import { IncrementalLoader } from "../../../components/IncrementalLoader";
import { api } from "../../../core/api/dynamic";
import { useAwait } from "../../../hooks/useAwait";
import { useGameStrings } from "../../../hooks/useGameStrings";
import { LocaleProvider, useLocale } from "../../../hooks/useLocale";
import type { Avatar } from "../../../protos/avatar";

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
  const locale = useLocale();
  const { avatars } = useAwait(() => api.avatars(), "avatars");
  const profileAvatarEntityStrings = useGameStrings("ProfileAvatarEntity");
  const groups = useMemo(() => {
    const groups = new Map<string, Avatar[]>();

    for (const avatar of avatars) {
      const name =
        profileAvatarEntityStrings[avatar.stuff_ui!.display_name] ??
        avatar.stuff_ui!.display_name;

      if (groups.has(name)) {
        groups.get(name)!.push(avatar);
      } else {
        groups.set(name, [avatar]);
      }
    }

    return groups;
  }, []);
  const ordered = useMemo(() => {
    const array = Array.from(groups.entries());
    return array
      .sort((a, b) => a[0].localeCompare(b[0], locale))
      .map(([name, avatars]) => ({
        name,
        avatars: avatars.sort((a, b) => {
          return a.stuff_ui!.grade - b.stuff_ui!.grade;
        }),
      }));
  }, []);

  return (
    <div className="avatars">
      <IncrementalLoader
        initial={40}
        intermediate={10}
        data={ordered}
        Component={AvatarCard}
      />
    </div>
  );
}
