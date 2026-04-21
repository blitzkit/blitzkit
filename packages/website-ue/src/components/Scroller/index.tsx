import { useEffect, useRef, type ComponentProps } from "react";
import { clamp } from "three/src/math/MathUtils.js";
import { classNames } from "../../core/ui/classNames";
import styles from "./index.module.css";

interface ScrollerProps extends ComponentProps<"div"> {}

export function Scroller({ children, className, ...props }: ScrollerProps) {
  const content = useRef<HTMLDivElement>(null!);
  const curtainLeft = useRef<HTMLDivElement>(null!);
  const curtainRight = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    function syncCurtains() {
      const maxScroll =
        content.current.scrollWidth - content.current.clientWidth;
      if (maxScroll <= 0) {
        curtainLeft.current.style.opacity = "0";
        curtainRight.current.style.opacity = "0";
        return;
      }

      const fadeDistance = Math.min(60, content.current.clientWidth * 0.15);
      const leftOpacity = clamp(
        content.current.scrollLeft / fadeDistance,
        0,
        1,
      );
      const rightOpacity = clamp(
        (maxScroll - content.current.scrollLeft) / fadeDistance,
        0,
        1,
      );

      curtainLeft.current.style.opacity = `${leftOpacity}`;
      curtainRight.current.style.opacity = `${rightOpacity}`;
    }

    function handleScroll() {
      syncCurtains();
    }

    function handleResize() {
      syncCurtains();
    }

    syncCurtains();

    window.addEventListener("resize", handleResize);
    content.current.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      content.current.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={classNames(styles.scroller, className)} {...props}>
      <div className={styles.content} ref={content}>
        {children}
      </div>

      <div ref={curtainLeft} data-side="left" className={styles.curtain} />
      <div ref={curtainRight} data-side="right" className={styles.curtain} />
    </div>
  );
}
