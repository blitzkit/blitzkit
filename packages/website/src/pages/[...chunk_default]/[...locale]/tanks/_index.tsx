import { TankSearch } from "../../../../components/TankSearch";
import { withLocale } from "../../../../hocs/withLocale";
import type { MaybeSkeletonComponentProps } from "../../../../types/maybeSkeletonComponentProps";

export const Page = withLocale<MaybeSkeletonComponentProps>(({ skeleton }) => (
  <TankSearch skeleton={skeleton} />
));
