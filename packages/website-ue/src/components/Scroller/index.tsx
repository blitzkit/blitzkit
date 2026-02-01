import { useEffect, useRef, type ComponentProps } from "react";
import { clamp } from "three/src/math/MathUtils.js";
import { classNames } from "../../core/ui/classNames";
import styles from "./index.module.css";

interface ScrollerProps extends ComponentProps<"div"> {}

export function Scroller({ children, className, ...props }: ScrollerProps) {
  const bar = useRef<HTMLDivElement>(null!);
  const container = useRef<HTMLDivElement>(null!);
  const content = useRef<HTMLDivElement>(null!);
  const curtainLeft = useRef<HTMLDivElement>(null!);
  const curtainRight = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    function updateBarSize() {
      const visible = content.current.clientWidth;
      const total = content.current.scrollWidth;

      if (total <= 0) return;

      bar.current.style.width = `${(visible / total) * 100}%`;
    }

    function syncBar() {
      const maxTravel = container.current.clientWidth - bar.current.clientWidth;
      const maxScroll =
        content.current.scrollWidth - content.current.clientWidth;

      if (maxScroll <= 0 || maxTravel <= 0) {
        bar.current.style.left = "0";
        return;
      }

      const ratio = content.current.scrollLeft / maxScroll;
      bar.current.style.left = `${ratio * maxTravel}px`;
    }

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

    let lastX = 0;

    function handlePointerDown(event: PointerEvent) {
      lastX = event.clientX;
      bar.current.setPointerCapture(event.pointerId);

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    function handlePointerMove(event: PointerEvent) {
      const dx = event.clientX - lastX;
      lastX = event.clientX;

      const maxTravel = container.current.clientWidth - bar.current.clientWidth;
      if (maxTravel <= 0) return;

      const maxScroll =
        content.current.scrollWidth - content.current.clientWidth;
      const delta = (dx / maxTravel) * maxScroll;

      content.current.scrollLeft += delta;

      syncBar();
    }

    function handlePointerUp(event: PointerEvent) {
      bar.current.releasePointerCapture(event.pointerId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    function handleScroll() {
      syncBar();
      syncCurtains();
    }

    function handleResize() {
      updateBarSize();
      syncBar();
      syncCurtains();
    }

    updateBarSize();
    syncBar();
    syncCurtains();

    bar.current.addEventListener("pointerdown", handlePointerDown);
    content.current.addEventListener("scroll", syncBar);
    window.addEventListener("resize", handleResize);
    content.current.addEventListener("scroll", handleScroll);

    return () => {
      bar.current.removeEventListener("pointerdown", handlePointerDown);
      content.current.removeEventListener("scroll", syncBar);
      window.removeEventListener("resize", handleResize);
      content.current.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={classNames(styles.scroller, className)} {...props}>
      <div className={styles.content} ref={content}>
        {children}
      </div>

      <div className={styles["bar-wrapper"]}>
        <div className={styles["bar-container"]} ref={container}>
          <div className={styles.bar} ref={bar} />
        </div>
      </div>

      <div ref={curtainLeft} data-side="left" className={styles.curtain} />
      <div ref={curtainRight} data-side="right" className={styles.curtain} />
    </div>
  );
}
