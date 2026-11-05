import { useEffect, useRef, type ComponentProps } from "react";
import { clamp } from "three/src/math/MathUtils.js";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

interface ScrollerProps extends ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
}

export function Scroller({
  children,
  className,
  orientation = "horizontal",
  ...props
}: ScrollerProps) {
  const content = useRef<HTMLDivElement>(null!);
  const curtainStart = useRef<HTMLDivElement>(null!);
  const curtainEnd = useRef<HTMLDivElement>(null!);

  const isHorizontal = orientation === "horizontal";

  useEffect(() => {
    function syncCurtains() {
      const maxScroll = isHorizontal
        ? content.current.scrollWidth - content.current.clientWidth
        : content.current.scrollHeight - content.current.clientHeight;
      const scrollPosition = isHorizontal
        ? content.current.scrollLeft
        : content.current.scrollTop;

      if (maxScroll <= 0) {
        curtainStart.current.style.opacity = "0";
        curtainEnd.current.style.opacity = "0";

        return;
      }

      const dimension = isHorizontal
        ? content.current.clientWidth
        : content.current.clientHeight;
      const fadeDistance = Math.min(60, dimension * 0.15);
      const startOpacity = clamp(scrollPosition / fadeDistance, 0, 1);
      const endOpacity = clamp(
        (maxScroll - scrollPosition) / fadeDistance,
        0,
        1,
      );

      curtainStart.current.style.opacity = `${startOpacity}`;
      curtainEnd.current.style.opacity = `${endOpacity}`;
    }

    syncCurtains();

    window.addEventListener("resize", syncCurtains);
    content.current.addEventListener("scroll", syncCurtains);

    return () => {
      window.removeEventListener("resize", syncCurtains);
      content.current.removeEventListener("scroll", syncCurtains);
    };
  }, [orientation]);

  return (
    <div
      className={classNames(styles.scroller, className)}
      {...props}
      data-orientation={orientation}
    >
      <div className={styles.content} ref={content}>
        {children}
      </div>

      <div ref={curtainStart} data-side="start" className={styles.curtain} />
      <div ref={curtainEnd} data-side="end" className={styles.curtain} />
    </div>
  );
}
