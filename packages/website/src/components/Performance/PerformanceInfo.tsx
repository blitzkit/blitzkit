import { formatCompact } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n/src/literals";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Callout, Flex } from "@radix-ui/themes";
import { awaitableAverageDefinitions } from "../../core/awaitables/averageDefinitions";
import { awaitableDiscoveredIdsDefinitions } from "../../core/awaitables/discoveredIdsDefinitions";
import { useLocale } from "../../hooks/useLocale";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { InlineSkeleton } from "../InlineSkeleton";

const [discoveredIdsDefinitions, averageDefinitions] = await Promise.all([
  awaitableDiscoveredIdsDefinitions,
  awaitableAverageDefinitions,
]);

export function PerformanceInfo({ skeleton }: MaybeSkeletonComponentProps) {
  const { strings, locale } = useLocale();
  const samples = formatCompact(
    locale,
    Math.round(discoveredIdsDefinitions.count)
  );
  const minutesAgo = Math.floor(
    (Date.now() - averageDefinitions.time) / (1000 * 60)
  );
  const hoursAgo = Math.floor(minutesAgo / 60);
  const timeAgo = literals(
    strings.website.tools.performance.estimation[
      hoursAgo === 0 ? "minutes" : "hours"
    ],
    { count: hoursAgo === 0 ? minutesAgo : hoursAgo }
  );

  return (
    <Flex justify="center">
      <Callout.Root style={{ width: "fit-content" }}>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          {skeleton && <InlineSkeleton width="9rem" />}

          {!skeleton &&
            literals(strings.website.tools.performance.estimation.body, {
              count: samples,
              age: timeAgo,
            })}
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
