import { literals } from "@blitzkit/i18n";
import { useStrings } from "../../hooks/useStrings";
import type { Avatar } from "../../protos/avatar";
import type { SkeletonProps } from "../../types/SkeletonProps";
import { Badge } from "../Badge";
import { Text } from "../Text";
import "./index.css";

interface Props {
  name: string;
  avatars: Avatar[];
}

const MAX_CARDS = 3;
const CARD_TRIM = "var(--space-3)";

export function AvatarCard(props: SkeletonProps<Props>) {
  return (
    <div className="avatar-card">
      {!props.skeleton && <Series avatars={props.avatars} />}

      <Text align="center" className="avatar-label">
        {props.skeleton ? "LOADING" : props.name}
      </Text>
    </div>
  );
}

interface SeriesProps {
  avatars: Avatar[];
}

function Series({ avatars }: SeriesProps) {
  const count = Math.min(avatars.length, MAX_CARDS);
  const strings = useStrings();

  return (
    <div className="avatar-series">
      {avatars.slice(-MAX_CARDS).map((avatar, index) => (
        <div
          key={avatar.name}
          className="avatar-entry"
          style={{
            filter: `brightness(${(index + 1) / count})`,
            top: `calc(${index} * ${CARD_TRIM})`,
            left: `calc(${index} * ${CARD_TRIM})`,
            width: `calc(100% - ${CARD_TRIM} * ${count - 1})`,
            height: `calc(100% - ${CARD_TRIM} * ${count - 1})`,
            backgroundImage: `url(/api/avatars/${avatar.name}.webp)`,
          }}
        />
      ))}

      {avatars.length > 1 && (
        <Badge color="gray" highContrast className="count">
          {literals(strings.units.x, { value: avatars.length })}
        </Badge>
      )}
    </div>
  );
}
