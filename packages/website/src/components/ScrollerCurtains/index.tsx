import { useCallback, useEffect, useRef } from "react";
import { clamp } from "three/src/math/MathUtils.js";
import { ScrollerOrientation } from "../Scroller";
import styles from "./index.module.css";

enum Axis {
  X = "x",
  Y = "y",
}

enum Side {
  Start = "start",
  End = "end",
}

interface ScrollerCurtainsProps {
  orientation?: ScrollerOrientation;

  // Whether the fade at each end of the scroll axis is rendered
  startCurtain?: boolean;
  endCurtain?: boolean;
}

const MAX_FADE_DISTANCE = 60;
const FADE_RATIO = 0.15;

const ORIENTATION_AXES = {
  [ScrollerOrientation.Horizontal]: [Axis.X],
  [ScrollerOrientation.Vertical]: [Axis.Y],
  [ScrollerOrientation.Both]: [Axis.X, Axis.Y],
} satisfies Record<ScrollerOrientation, Axis[]>;

const DIMENSIONS = {
  [Axis.X]: {
    scroll: "scrollLeft",
    scrollSize: "scrollWidth",
    clientSize: "clientWidth",
  },
  [Axis.Y]: {
    scroll: "scrollTop",
    scrollSize: "scrollHeight",
    clientSize: "clientHeight",
  },
} as const;

// Fades the edges of the parent element, which must already be scrollable
export function ScrollerCurtains({
  orientation = ScrollerOrientation.Horizontal,
  startCurtain = true,
  endCurtain = true,
}: ScrollerCurtainsProps) {
  const anchor = useRef<HTMLSpanElement>(null!);

  const sync = useCallback(
    (element: HTMLElement) => {
      for (const axis of ORIENTATION_AXES[orientation]) {
        const dimension = DIMENSIONS[axis];
        const clientSize = element[dimension.clientSize];
        const position = element[dimension.scroll];
        const overflow = element[dimension.scrollSize] - clientSize;
        const fadeDistance = Math.min(
          MAX_FADE_DISTANCE,
          clientSize * FADE_RATIO,
        );

        const start =
          !startCurtain || overflow <= 0
            ? 0
            : clamp(position / fadeDistance, 0, 1);
        const end =
          !endCurtain || overflow <= 0
            ? 0
            : clamp((overflow - position) / fadeDistance, 0, 1);

        element.style.setProperty(
          `--scroller-curtains-${axis}-${Side.Start}`,
          `${start}`,
        );
        element.style.setProperty(
          `--scroller-curtains-${axis}-${Side.End}`,
          `${end}`,
        );
      }
    },
    [orientation, startCurtain, endCurtain],
  );

  useEffect(() => {
    let element = anchor.current.parentElement!;

    // Skips boxless wrappers like astro-island to reach the actual scroller
    while (getComputedStyle(element).display === "contents") {
      element = element.parentElement!;
    }

    const handleSync = () => sync(element);
    const resizeObserver = new ResizeObserver(handleSync);

    // Tracks children as they mount and unmount instead of re-subscribing every render
    const mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        record.removedNodes.forEach((node) => {
          if (node instanceof Element) resizeObserver.unobserve(node);
        });
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) resizeObserver.observe(node);
        });
      }
    });

    element.classList.add(styles.target);
    resizeObserver.observe(element);
    Array.from(element.children).forEach((child) =>
      resizeObserver.observe(child),
    );
    mutationObserver.observe(element, { childList: true });
    element.addEventListener("scroll", handleSync, { passive: true });

    handleSync();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      element.removeEventListener("scroll", handleSync);
      element.classList.remove(styles.target);

      for (const axis of Object.values(Axis)) {
        for (const side of Object.values(Side)) {
          element.style.removeProperty(`--scroller-curtains-${axis}-${side}`);
        }
      }
    };
  }, [sync]);

  return <span ref={anchor} className={styles.anchor} />;
}
