import { PageWrapper } from "../../../../components/PageWrapper";
import { TankleGuesser } from "../../../../components/Tankle";
import { randomTank } from "../../../../core/blitzkit/tankle";
import {
  type LocaleAcceptorProps,
  LocaleProvider,
} from "../../../../hooks/useLocale";
import { Tankle } from "../../../../stores/tankle";
import type { MaybeSkeletonComponentProps } from "../../../../types/maybeSkeletonComponentProps";

export function Page({
  locale,
  skeleton,
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  Tankle.useInitialization(randomTank());

  return (
    <LocaleProvider locale={locale}>
      <PageWrapper color="teal" maxWidth="80rem">
        {!skeleton && <TankleGuesser />}
      </PageWrapper>
    </LocaleProvider>
  );
}
