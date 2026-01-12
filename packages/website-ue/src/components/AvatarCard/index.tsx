import type { Avatar } from "../../protos/avatar";
import { Text } from "../Text";
import "./index.css";

interface Props {
  avatar: Avatar;
}

export function AvatarCard({ avatar }: Props) {
  return (
    <div className="avatar-card">
      <div
        className="avatar-image"
        style={{ backgroundImage: `url(/api/avatars/${avatar.name}.webp)` }}
      />
      <Text className="avatar-label">{avatar.name}</Text>
    </div>
  );
}
