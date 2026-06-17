import type { ReactNode } from "react";
import { ErrorWrapper } from "../components/ErrorWrapper";

export function withErrorWrapper<Props extends object>(
  Component: (props: Props) => ReactNode,
) {
  return function (props: Props) {
    return (
      <ErrorWrapper>
        <Component {...props} />
      </ErrorWrapper>
    );
  };
}
