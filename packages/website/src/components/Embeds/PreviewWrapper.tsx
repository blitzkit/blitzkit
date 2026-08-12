import { Box } from "@radix-ui/themes";
import { useEffect, useRef } from "react";
import { embedPreviews } from "../../constants/embeds";
import { useEmbedStateCurry } from "../../stores/embedState/utilities";

interface PreviewWrapperProps {
  name: keyof typeof embedPreviews;
  naked?: boolean;
}

export function PreviewWrapper({ name, naked }: PreviewWrapperProps) {
  const { useEmbedState } = useEmbedStateCurry();

  const width = useEmbedState("width");
  const height = useEmbedState("height");

  const Preview = embedPreviews[name];

  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapper.current) return;

    wrapper.current.classList.remove("preview-container-animated");
    void wrapper.current.offsetWidth;
    wrapper.current.classList.add("preview-container-animated");
  }, [width, height]);

  if (naked) {
    return (
      <Box
        position="absolute"
        top="0"
        left="50%"
        style={{ transform: "translate(-50%, 0) scale(0.75)" }}
        width={`${width}px`}
        height={`${height}px`}
      >
        <Preview />
      </Box>
    );
  }

  return (
    <Box
      position="absolute"
      top="50%"
      left="50%"
      overflow="hidden"
      style={{ transform: naked ? "scale(0.25)" : "translate(-50%, -50%)" }}
      ref={wrapper}
      className="preview-container-animated"
      width={`${width}px`}
      height={`${height}px`}
    >
      <Preview />
    </Box>
  );
}
