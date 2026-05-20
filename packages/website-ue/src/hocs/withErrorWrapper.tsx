import type { ReactNode } from "react";
import { ErrorWrapper } from "../components/ErrorWrapper";

export function withErrorWrapper<Props extends {}>(
  Component: (props: Props) => ReactNode,
) {
  return function (props: Props) {
    <ErrorWrapper>
      <Component {...props} />
    </ErrorWrapper>;
  };
}
