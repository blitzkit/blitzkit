import { literals } from "@blitzkit/i18n";
import { useStrings } from "../../hooks/useStrings";
import type { Avatar } from "../../protos/avatar";
import type { PropsWithSkeleton } from "../../types/propsWithSkeleton";
import { Badge } from "../Badge";
import { InlineSkeleton } from "../InlineSkeleton";
import { Skeleton } from "../Skeleton";
import { Text } from "../Text";
import "./index.css";

interface Props {
  name: string;
  avatars: Avatar[];
}

const MAX_CARDS = 3;
const CARD_TRIM = "var(--space-3)";

export function AvatarCard(props: PropsWithSkeleton<Props>) {
  return (
    <div className="avatar-card">
      <Series skeleton={props.skeleton} {...props} />

      <Text align="center" className="avatar-label">
        {props.skeleton ? <InlineSkeleton /> : props.name}
      </Text>
    </div>
  );
}

interface SeriesProps {
  avatars: Avatar[];
}

function Series(props: PropsWithSkeleton<SeriesProps>) {
  const count = Math.min(props.skeleton ? 0 : props.avatars.length, MAX_CARDS);
  const strings = useStrings();

  return (
    <div className="avatar-series">
      {!props.skeleton &&
        props.avatars.slice(-MAX_CARDS).map((avatar, index) => (
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

      {!props.skeleton && props.avatars.length > 1 && (
        <Badge color="gray" highContrast className="count">
          {literals(strings.units.x, { value: props.avatars.length })}
        </Badge>
      )}

      {props.skeleton && <Skeleton className="avatar-entry" />}
    </div>
  );
}
