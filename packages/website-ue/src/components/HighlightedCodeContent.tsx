import type { Root } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Code } from "./Code";

interface Props {
  tree: Root | string;
}

export function HighlightedCodeContent({ tree }: Props) {
  const node =
    typeof tree === "string"
      ? tree
      : toJsxRuntime(tree, { Fragment, jsx, jsxs });

  return <Code variant="solid" children={node} />;
}
