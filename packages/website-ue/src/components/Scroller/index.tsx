import { useEffect, useRef, type ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import styles from "./index.module.css";

interface ScrollerProps extends ComponentProps<"div"> {}

export function Scroller({ children, className, ...props }: ScrollerProps) {
  const bar = useRef<HTMLDivElement>(null!);
  const container = useRef<HTMLDivElement>(null!);
  const content = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    function updateSize() {
      bar.current.style.width = `${(content.current.clientWidth / content.current.scrollWidth) * 100}%`;
    }

    let lastX = 0;
    function handlePointerDown(event: PointerEvent) {
      lastX = event.clientX;

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    function handlePointerMove(event: PointerEvent) {
      const dx = event.clientX - lastX;
      lastX = event.clientX;
    }
    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    updateSize();

    bar.current.addEventListener("pointerdown", handlePointerDown);

    return () => {
      bar.current.removeEventListener("pointerdown", handlePointerDown);
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
    </div>
  );
}
