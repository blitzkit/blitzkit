import { literals } from "@blitzkit/i18n";
import { Grade } from "@protos/auto_items";
import { DownloadIcon, StarFilledIcon } from "@radix-ui/react-icons";
import type { Color } from "../../core/ui/color";
import { useGameStrings } from "../../hooks/useGameStrings";
import { useStrings } from "../../hooks/useStrings";
import type { Avatar } from "../../protos/avatar";
import type { PropsWithSkeleton } from "../../types/propsWithSkeleton";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import { InlineSkeleton } from "../InlineSkeleton";
import { Link } from "../Link";
import { Skeleton } from "../Skeleton";
import { Text } from "../Text";
import styles from "./index.module.css";

interface Props {
  name: string;
  avatars: Avatar[];
}

const MAX_CARDS = 3;
const CARD_TRIM = "var(--space-3)";

export function AvatarCard(props: PropsWithSkeleton<Props>) {
  const card = (
    <div className={styles.card}>
      <Series skeleton={props.skeleton} {...props} />

      <Text align="center" className={styles.label}>
        {props.skeleton ? <InlineSkeleton /> : props.name}
      </Text>
    </div>
  );

  if (props.skeleton) return card;

  return (
    <Dialog.Root>
      <Dialog.Trigger>{card}</Dialog.Trigger>
      <Dialog.Content>
        <Text size="major" weight="bold">
          {props.name}
        </Text>

        <Details avatars={props.avatars} />
      </Dialog.Content>
    </Dialog.Root>
  );
}

interface DetailsProps {
  avatars: Avatar[];
}

const gradeColors: Record<Grade, Color> = {
  [Grade.GRADE_GRADE_UNSPECIFIED]: "gray",
  [Grade.GRADE_GRADE_COMMON]: "gray",
  [Grade.GRADE_GRADE_RARE]: "blue",
  [Grade.GRADE_GRADE_EPIC]: "purple",
  [Grade.GRADE_GRADE_LEGENDARY]: "amber",
};

function Details({ avatars }: DetailsProps) {
  const gameStrings = useGameStrings("ProfileAvatarEntity");
  const strings = useStrings();

  return [...avatars].reverse().map((avatar) => {
    const description = gameStrings[avatar.stuff_ui!.description];
    const obtaining = gameStrings[avatar.stuff_ui!.obtaining_methods];
    const hasDescription = description || obtaining;

    return (
      <div className={styles.details}>
        <div className={styles.preview} data-grade={avatar.stuff_ui!.grade}>
          <div
            className={styles.image}
            style={{
              backgroundImage: `url(/api/avatars/${avatar.name}.webp)`,
            }}
          />
          <Badge
            color={gradeColors[avatar.stuff_ui!.grade]}
            className={styles.grade}
          >
            <StarFilledIcon />
            {strings.grades[avatar.stuff_ui!.grade]}
          </Badge>
        </div>

        <div className={styles.description}>
          <Text>
            {hasDescription ? (
              <>
                {description} {obtaining}
              </>
            ) : (
              strings.avatars.no_description
            )}
          </Text>

          <Link
            underline="never"
            href={`/api/avatars/${avatar.name}.webp`}
            download
          >
            <Button>
              <DownloadIcon /> {strings.avatars.download}
            </Button>
          </Link>
        </div>
      </div>
    );
  });
}

interface SeriesProps {
  avatars: Avatar[];
}

function Series(props: PropsWithSkeleton<SeriesProps>) {
  const count = Math.min(props.skeleton ? 0 : props.avatars.length, MAX_CARDS);
  const strings = useStrings();

  return (
    <div className={styles.series}>
      {!props.skeleton &&
        props.avatars.slice(-MAX_CARDS).map((avatar, index) => (
          <div
            key={avatar.name}
            className={styles.entry}
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
        <Badge color="gray" highContrast className={styles.count}>
          {literals(strings.units.x, { value: props.avatars.length })}
        </Badge>
      )}

      {props.skeleton && <Skeleton className={styles.entry} />}
    </div>
  );
}
