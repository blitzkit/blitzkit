import { Code, Tooltip, type CodeProps } from "@radix-ui/themes";
import { useState } from "react";
import { useLocale } from "../hooks/useLocale";

export interface CopyableCodeProps extends CodeProps {
  copy?: string;
}

export function CopyableCode({
  copy,
  onClick,
  onPointerLeave,
  style,
  children,
  ...props
}: CopyableCodeProps) {
  const [copied, setCopied] = useState(false);
  const { strings } = useLocale();

  return (
    <Tooltip open={copied} content={strings.website.common.copy_button.copied}>
      <Code
        {...props}
        style={{ ...(copy ? { cursor: "copy" } : {}), ...style }}
        onClick={(event) => {
          onClick?.(event);
          if (!copy) return;
          navigator.clipboard.writeText(copy);
          setCopied(true);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          setCopied(false);
        }}
      >
        {children}
      </Code>
    </Tooltip>
  );
}
