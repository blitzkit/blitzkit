import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  children: ReactNode;
}

export function ErrorWrapper({ children }: Props) {
  return (
    <ErrorBoundary
      fallback={null}
      onError={() => {
        console.log("what?");
        document.body.classList.add("error");
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
