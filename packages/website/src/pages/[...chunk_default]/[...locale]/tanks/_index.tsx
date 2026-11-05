import { TankSearch } from "../../../../components/TankSearch";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../../hooks/useLocale";
import type { MaybeSkeletonComponentProps } from "../../../../types/maybeSkeletonComponentProps";

export function Page({
  locale,
  skeleton,
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  return (
    <LocaleProvider locale={locale}>
      <TankSearch skeleton={skeleton} />
    </LocaleProvider>
  );
}
