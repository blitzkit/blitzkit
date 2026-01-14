import { useGameStrings } from "../../hooks/useGameStrings";
import { useLocale } from "../../hooks/useLocale";
import type { Avatar } from "../../protos/avatar";
import { Text } from "../Text";
import "./index.css";

interface Props {
  avatar: Avatar;
}

export function AvatarCard({ avatar }: Props) {
  const { locale } = useLocale();
  const profileAvatarEntityStrings = useGameStrings("ProfileAvatarEntity");

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
