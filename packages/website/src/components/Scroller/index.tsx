import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  type ComponentProps,
  type PointerEvent,
} from "react";
import { clamp } from "three/src/math/MathUtils.js";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

export enum ScrollerOrientation {
  Horizontal = "horizontal",
  Vertical = "vertical",
  Both = "both",
}

enum Axis {
  X = "x",
  Y = "y",
}

enum Side {
  Start = "start",
  End = "end",
}

interface ScrollerProps extends ComponentProps<"div"> {
  orientation?: ScrollerOrientation;

  // Whether the fade at each end of the scroll axis is rendered
  startCurtain?: boolean;
  endCurtain?: boolean;
}

const MIN_THUMB_SIZE = 32;
const MAX_FADE_DISTANCE = 60;
const FADE_RATIO = 0.15;

const SIDES = [Side.Start, Side.End];

const ORIENTATION_AXES = {
  [ScrollerOrientation.Horizontal]: [Axis.X],
  [ScrollerOrientation.Vertical]: [Axis.Y],
  [ScrollerOrientation.Both]: [Axis.X, Axis.Y],
} satisfies Record<ScrollerOrientation, Axis[]>;

// DOM property names per axis so the logic below stays axis-agnostic
const DIMENSIONS = {
  [Axis.X]: {
    size: "width",
    scroll: "scrollLeft",
    scrollSize: "scrollWidth",
    clientSize: "clientWidth",
    offsetSize: "offsetWidth",
    pointer: "clientX",
    rectStart: "left",
    translate: "translateX",
  },
  [Axis.Y]: {
    size: "height",
    scroll: "scrollTop",
    scrollSize: "scrollHeight",
    clientSize: "clientHeight",
    offsetSize: "offsetHeight",
    pointer: "clientY",
    rectStart: "top",
    translate: "translateY",
  },
} as const;

interface Drag {
  pointer: number;
  scroll: number;
  // Content pixels scrolled per pixel of thumb travel
  ratio: number;
  axis: Axis;
}

export function Scroller({
  children,
  className,
  orientation = ScrollerOrientation.Horizontal,
  startCurtain = true,
  endCurtain = true,
  ...props
}: ScrollerProps) {
  const content = useRef<HTMLDivElement>(null!);
  const curtains = useRef<Record<Axis, Record<Side, HTMLDivElement | null>>>({
    [Axis.X]: { [Side.Start]: null, [Side.End]: null },
    [Axis.Y]: { [Side.Start]: null, [Side.End]: null },
  });
  const bars = useRef<Record<Axis, HTMLDivElement | null>>({
    [Axis.X]: null,
    [Axis.Y]: null,
  });
  const thumbs = useRef<Record<Axis, HTMLDivElement | null>>({
    [Axis.X]: null,
    [Axis.Y]: null,
  });
  const drag = useRef<Drag | undefined>(undefined);

  const axes = ORIENTATION_AXES[orientation];
  const curtainSides = SIDES.filter((side) =>
    side === Side.Start ? startCurtain : endCurtain,
  );

  const sync = useCallback(() => {
    const element = content.current;

    for (const axis of axes) {
      const dimension = DIMENSIONS[axis];
      const scrollSize = element[dimension.scrollSize];
      const clientSize = element[dimension.clientSize];
      const position = element[dimension.scroll];
      const overflow = scrollSize - clientSize;

      // Curtains fade the edges the scrolling content slides under
      const fadeDistance = Math.min(MAX_FADE_DISTANCE, clientSize * FADE_RATIO);
      const curtain = curtains.current[axis];
      const start = curtain[Side.Start];
      const end = curtain[Side.End];

      if (start) {
        start.style.opacity = `${
          overflow <= 0 ? 0 : clamp(position / fadeDistance, 0, 1)
        }`;
      }

      if (end) {
        end.style.opacity = `${
          overflow <= 0 ? 0 : clamp((overflow - position) / fadeDistance, 0, 1)
        }`;
      }

      // Thumbs mirror the scroll position over the track
      const bar = bars.current[axis];
      const thumb = thumbs.current[axis];

      if (!bar || !thumb) continue;

      const hidden = overflow <= 1;
      bar.dataset.hidden = `${hidden}`;

      if (hidden) continue;

      const track = bar[dimension.clientSize];
      const size = Math.max(MIN_THUMB_SIZE, (track * clientSize) / scrollSize);
      const offset = (position / overflow) * (track - size);

      thumb.style[dimension.size] = `${size}px`;
      thumb.style.transform = `${dimension.translate}(${offset}px)`;
    }
  }, [axes]);

  useEffect(() => {
    const element = content.current;
    const resizeObserver = new ResizeObserver(sync);

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

    resizeObserver.observe(element);
    Array.from(element.children).forEach((child) =>
      resizeObserver.observe(child),
    );
    mutationObserver.observe(element, { childList: true });
    element.addEventListener("scroll", sync, { passive: true });

    sync();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      element.removeEventListener("scroll", sync);
    };
  }, [sync]);

  const handleThumbPointerDown = useCallback(
    (axis: Axis, event: PointerEvent<HTMLDivElement>) => {
      const element = content.current;
      const bar = bars.current[axis]!;
      const thumb = event.currentTarget;
      const dimension = DIMENSIONS[axis];
      const trackSpace =
        bar[dimension.clientSize] - thumb[dimension.offsetSize];
      const overflow =
        element[dimension.scrollSize] - element[dimension.clientSize];

      event.preventDefault();
      thumb.setPointerCapture(event.pointerId);
      thumb.dataset.dragging = "true";

      drag.current = {
        axis,
        pointer: event[dimension.pointer],
        scroll: element[dimension.scroll],
        ratio: trackSpace > 0 ? overflow / trackSpace : 0,
      };
    },
    [],
  );

  // Pointer capture routes moves to the dragged thumb, so the axis comes from the drag
  const handleThumbPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!drag.current) return;

      const { axis, pointer, scroll, ratio } = drag.current;
      const dimension = DIMENSIONS[axis];

      content.current[dimension.scroll] =
        scroll + (event[dimension.pointer] - pointer) * ratio;
    },
    [],
  );

  const handleThumbPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      drag.current = undefined;
      delete event.currentTarget.dataset.dragging;
    },
    [],
  );

  // Clicking the empty track pages toward the click
  const handleTrackPointerDown = useCallback(
    (axis: Axis, event: PointerEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;

      const element = content.current;
      const dimension = DIMENSIONS[axis];
      const thumbStart =
        thumbs.current[axis]!.getBoundingClientRect()[dimension.rectStart];
      const page = element[dimension.clientSize];

      element.scrollBy({
        [dimension.rectStart]:
          event[dimension.pointer] < thumbStart ? -page : page,
        behavior: "smooth",
      });
    },
    [],
  );

  return (
    <div
      className={classNames(styles.scroller, className)}
      {...props}
      data-orientation={orientation}
    >
      <div className={styles.content} ref={content}>
        {children}
      </div>

      {/* Curtains render before every bar so no curtain paints over a bar */}
      {axes.map((axis) => (
        <Fragment key={axis}>
          {curtainSides.map((side) => (
            <div
              key={side}
              ref={(element) => {
                curtains.current[axis][side] = element;
              }}
              className={styles.curtain}
              data-axis={axis}
              data-side={side}
            />
          ))}
        </Fragment>
      ))}

      {axes.map((axis) => (
        <div
          key={axis}
          ref={(element) => {
            bars.current[axis] = element;
          }}
          className={styles.bar}
          data-axis={axis}
          data-hidden="true"
          onPointerDown={(event) => handleTrackPointerDown(axis, event)}
        >
          <div
            ref={(element) => {
              thumbs.current[axis] = element;
            }}
            className={styles.thumb}
            onPointerDown={(event) => handleThumbPointerDown(axis, event)}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
          />
        </div>
      ))}
    </div>
  );
}
