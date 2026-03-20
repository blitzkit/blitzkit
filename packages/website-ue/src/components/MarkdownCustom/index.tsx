import type { ComponentProps, FunctionComponent } from "react";
import Markdown from "react-markdown";
import { classNames } from "../../core/ui/classNames";
import { Code } from "../Code";
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
          p: Text as FunctionComponent<ComponentProps<"p">>,
          code: Code,
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}
