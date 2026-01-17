import fuzzysort from "fuzzysort";
import { useMemo } from "react";
import { api } from "../../core/api/dynamic";
import { useAwait } from "../../hooks/useAwait";
import { useGameStrings } from "../../hooks/useGameStrings";
import { useLocale } from "../../hooks/useLocale";
import type { Avatar } from "../../protos/avatar";
import { Avatars } from "../../stores/avatars";
import { AvatarCard } from "../AvatarCard";
import { IncrementalLoader } from "../IncrementalLoader";
import "./index.css";

const { go } = fuzzysort;

const indexingPattern = /.+_(\d+)$/;

export function AvatarsList() {
  const locale = useLocale();
  const search = Avatars.use((state) => state.search);
  const { avatars } = useAwait(() => api.avatars(), "avatars");
  const gameStrings = useGameStrings("ProfileAvatarEntity");
  const groups = useMemo(() => {
    const groups = new Map<string, Avatar[]>();

    for (const avatar of avatars) {
      const name =
        gameStrings[avatar.stuff_ui!.display_name] ??
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
        key: name,
        name,
        avatars: avatars.sort((a, b) => {
          const gradeA = a.stuff_ui!.grade;
          const gradeB = b.stuff_ui!.grade;
          let diff = gradeA - gradeB;

          if (diff === 0) {
            const matchesA = a.name.match(indexingPattern);
            const matchesB = b.name.match(indexingPattern);

            if (matchesA && matchesB) {
              const indexA = Number(matchesA[1]);
              const indexB = Number(matchesB[1]);

              diff = indexA - indexB;
            }
          }

          return diff;
        }),
      }));
  }, []);
  const filtered = useMemo(() => {
    if (search === null) return ordered;

    const searched = go(search, ordered, { keys: ["name"] });

    return searched.map((result) => result.obj);
  }, [search]);

  return (
    <div className="avatars-list">
      <IncrementalLoader
        initial={7 * 5}
        intermediate={7 * 3}
        data={filtered}
        Component={AvatarCard}
      />
    </div>
  );
}
