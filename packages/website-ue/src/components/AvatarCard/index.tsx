import { api } from "../../core/api/dynamic";
import { useAwait } from "../../hooks/useAwait";
import type { Avatar } from "../../protos/avatar";
import { Text } from "../Text";
import "./index.css";

interface Props {
  avatar: Avatar;
}

export function AvatarCard({ avatar }: Props) {
  // const { locale } = useLocale();
  const { locale } = { locale: "en" };
  const profileAvatarEntityStrings = useAwait(
    () => api.groupedGameStrings(locale, "ProfileAvatarEntity"),
    "profile-avatar-entity-strings"
  );

  return (
    <div className="avatar-card">
      <div
        className="avatar-image"
        style={{ backgroundImage: `url(/api/avatars/${avatar.name}.webp)` }}
      />
      <Text align="center" className="avatar-label">
        {profileAvatarEntityStrings[avatar.stuff_ui!.display_name]}
      </Text>
    </div>
  );
}
