import { CluesGuesser } from "../../../../../components/GuessClues";
import { PageWrapper } from "../../../../../components/PageWrapper";
import { randomTank } from "../../../../../core/blitzkit/guessClues";
import {
  type LocaleAcceptorProps,
  LocaleProvider,
} from "../../../../../hooks/useLocale";
import { GuessClues } from "../../../../../stores/guessClues";
import type { MaybeSkeletonComponentProps } from "../../../../../types/maybeSkeletonComponentProps";

export function Page({
  locale,
  skeleton,
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  GuessClues.useInitialization(randomTank());

  return (
    <LocaleProvider locale={locale}>
      <PageWrapper color="teal" maxWidth="80rem">
        {!skeleton && <CluesGuesser />}
      </PageWrapper>
    </LocaleProvider>
  );
}
