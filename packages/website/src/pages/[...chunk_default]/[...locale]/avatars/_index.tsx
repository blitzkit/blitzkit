import { AvatarsSearch } from "../../../../components/Avatars/Search";
import { AvatarsList } from "../../../../components/AvatarsList";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../../hooks/useLocale";
import type { MaybeSkeletonComponentProps } from "../../../../types/maybeSkeletonComponentProps";

export function Page({
  locale,
  ...props
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content {...props} />
    </LocaleProvider>
  );
}

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  return (
    <>
      <AvatarsSearch skeleton={skeleton} />
      <AvatarsList skeleton={skeleton} />
    </>
  );
}
