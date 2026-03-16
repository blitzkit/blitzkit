import type { ComponentProps } from "react";
import Markdown from "react-markdown";
import { classNames } from "../../core/ui/classNames";
import { Text } from "../Text";
import styles from "./index.module.css";

interface MarkdownCustom extends ComponentProps<"div"> {
  body: string;
}

export function MarkdownCustom({ body, className, ...props }: MarkdownCustom) {
  return (
    <div className={classNames(className, styles.markdown)} {...props}>
      <Markdown
        components={{
          p: Text,
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}
