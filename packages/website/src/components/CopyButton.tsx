import { useState } from "react";
import { useStrings } from "../hooks/useStrings";
import { Button, type ButtonProps } from "./Button";
import { Tooltip } from "./Tooltip";

const COPIED_TOOLTIP_DURATION = 2000;

interface CopyButtonProps extends ButtonProps {
  copy: () => string | undefined;
}

export function CopyButton({ copy, style, ...props }: CopyButtonProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const strings = useStrings();

  return (
    <Tooltip
      open={tooltipOpen}
      tooltip={strings.website.common.copy_button.copied}
      style={style}
    >
      <Button
        {...props}
        onClick={() => {
          const content = copy();

          if (content === undefined) return;

          navigator.clipboard.writeText(content);
          setTooltipOpen(true);
          setTimeout(() => setTooltipOpen(false), COPIED_TOOLTIP_DURATION);
        }}
      />
    </Tooltip>
  );
}
