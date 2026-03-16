import Markdown from "react-markdown";
import { Text } from "../Text";
import styles from "./index.module.css";

interface Props {
  body: string;
}

export function MarkdownCustom({ body }: Props) {
  return (
    <div className={styles.markdown}>
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
