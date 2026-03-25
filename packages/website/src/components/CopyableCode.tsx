import { Code, Tooltip } from "@radix-ui/themes";
import { useState, type ReactNode } from "react";
import { useLocale } from "../hooks/useLocale";

interface CopyableCodeProps {
  copy?: string;
  children: ReactNode;
}

export function CopyableCode({ copy, children }: CopyableCodeProps) {
  const [copied, setCopied] = useState(false);
  const { strings } = useLocale();

  return (
    <Tooltip open={copied} content={strings.website.common.copy_button.copied}>
      <Code
        variant="soft"
        highContrast
        color="gray"
        style={{ cursor: copy ? "copy" : "default" }}
        onClick={() => {
          if (!copy) return;
          navigator.clipboard.writeText(copy);
          setCopied(true);
        }}
        onPointerLeave={() => setCopied(false)}
      >
        {children}
      </Code>
    </Tooltip>
  );
}
