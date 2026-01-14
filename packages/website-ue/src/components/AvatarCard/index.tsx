import { useGameStrings } from "../../hooks/useGameStrings";
import type { Avatar } from "../../protos/avatar";
import type { SkeletonProps } from "../../types/SkeletonProps";
import { Text } from "../Text";
import "./index.css";

export function AvatarCard(props: SkeletonProps<Avatar>) {
  const profileAvatarEntityStrings = useGameStrings("ProfileAvatarEntity");

  return (
    <div className="avatar-card">
      <div
        className="avatar-image"
        style={{
          backgroundImage: props.skeleton
            ? undefined
            : `url(/api/avatars/${props.name}.webp)`,
        }}
      />
      <Text align="center" className="avatar-label">
        {props.skeleton
          ? "LOADING"
          : profileAvatarEntityStrings[props.stuff_ui!.display_name]}
      </Text>
    </div>
  );
}
