import { useState, type ReactNode } from "react";
import {
  ErrorBoundary,
  getErrorMessage,
  type FallbackProps,
} from "react-error-boundary";
import { discordLink } from "../../config/socials";
import { Button } from "../Button";
import { Code } from "../Code";
import { Heading } from "../Heading";
import { Link } from "../Link";
import { Text } from "../Text";
import styles from "./index.module.css";

interface Props {
  children: ReactNode;
}

export function ErrorWrapper({ children }: Props) {
  return (
    <ErrorBoundary fallbackRender={(props) => <Fallback {...props} />}>
      {children}
    </ErrorBoundary>
  );
}

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  const [showError, setShowError] = useState(false);

  let body: string | undefined;

  if (error instanceof Error) {
    body = error.stack || getErrorMessage(error);
  } else {
    body = getErrorMessage(error);
  }

  body ??= "No error message";

  return (
    <div className={styles["error-display"]}>
      <div className={styles.info}>
        <Heading size="3">BlitzKit crashed</Heading>
        <Text lowContrast>Sorry about that! You have a couple of options.</Text>
      </div>

      {showError && (
        <Code variant="solid" className={styles.error}>
          {body}
          <div className={styles.cover} />
        </Code>
      )}

      <div className={styles.options}>
        {!showError && (
          <Button variant="outline" onClick={() => setShowError(true)}>
            View error
          </Button>
        )}

        {showError && (
          <Button
            variant="outline"
            onClick={() => navigator.clipboard.writeText(body)}
          >
            Copy error
          </Button>
        )}

        <Link href="" underline="never">
          <Button variant="outline">Hard reload</Button>
        </Link>

        <Button variant="outline" onClick={resetErrorBoundary}>
          Soft reset
        </Button>

        <Link href={discordLink} target="_blank" underline="never">
          <Button>Discord server</Button>
        </Link>
      </div>
    </div>
  );
}
