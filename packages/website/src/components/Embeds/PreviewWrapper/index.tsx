import { useEffect, useRef } from "react";
import { embedPreviews } from "../../../config/embeds";
import { classNames } from "../../../ui/classNames";
import { useEmbedStateCurry } from "../../../stores/embedState/utilities";
import styles from "./index.module.css";

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

    wrapper.current.classList.remove(styles.animated);
    void wrapper.current.offsetWidth;
    wrapper.current.classList.add(styles.animated);
  }, [width, height]);

  if (naked) {
    return (
      <div
        className={styles.naked}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Preview />
      </div>
    );
  }

  return (
    <div
      ref={wrapper}
      className={classNames(styles.preview, styles.animated)}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <Preview />
    </div>
  );
}
