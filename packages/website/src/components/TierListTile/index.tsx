import { useCallback, useRef, type PointerEvent } from "react";
import { api } from "../../api/dynamic";
import { tierListInsertionMarker, tierListTable } from "../../config/tierList";
import {
  showInsertionMarker,
  type InsertionMarkerPlacement,
} from "../../core/blitzkit/showInsertionMarker";
import { TierList } from "../../stores/tierList";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { TankCard } from "../TankCard";
import { TankCardSkeleton } from "../TankCardSkeleton";
import styles from "./index.module.css";

// Fraction of the viewport at either edge that scrolls the page while dragging
const SCROLL_ZONE = 1 / 3;
const SCROLL_ZONE_END = 1 - SCROLL_ZONE;

const tankDefinitions = await api.tanks();

export interface TierListTileProps {
  id: number;
}

interface TierListDropTarget {
  row: number;
  index: number;
  marker: InsertionMarkerPlacement;
}

export function TierListTile(
  props: MaybeSkeletonComponentProps<TierListTileProps>,
) {
  const card = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastFrame = useRef(0);
  const tankId = props.skeleton ? undefined : props.id;

  // Where the card would land if dropped now; undefined sends it back to the pool
  const target = useRef<TierListDropTarget | undefined>(undefined);

  // Hit tests the cursor against the rows and the tanks already in them
  const updateTarget = useCallback(() => {
    const { x, y } = pointer.current;
    const below = document
      .elementsFromPoint(x, y)
      .filter((element) => !card.current!.contains(element)) as HTMLElement[];

    // Hit testing skips table rows themselves, so the row is found from a cell inside it
    const hit = below.find((element) => element.closest("[data-row]") !== null);

    if (hit === undefined) {
      target.current = undefined;
      showInsertionMarker(tierListInsertionMarker.current!, undefined);
      return;
    }

    const row = hit.closest<HTMLElement>("[data-row]")!;
    const cell = row.querySelector("[data-tier-cell]")!;
    const grid = cell.querySelector("[data-tier-grid]")!;
    const cellRect = cell.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(grid).columnGap);
    const padding = parseFloat(getComputedStyle(cell).paddingLeft);

    // Indexed without the dragged card since it leaves its spot when placed
    const siblings = [
      ...grid.querySelectorAll<HTMLElement>("[data-tank-id]"),
    ].filter((element) => element !== card.current);
    const tile = below.find((element) => siblings.includes(element));

    let index = siblings.length;

    if (tile !== undefined) {
      const tileRect = tile.getBoundingClientRect();

      index =
        siblings.indexOf(tile) +
        (x > tileRect.left + tileRect.width / 2 ? 1 : 0);
    }

    // An empty row marks its start, otherwise the gap beside the nearest tank
    const start = cellRect.left + padding / 2;
    let marker: InsertionMarkerPlacement = {
      position: [start, cellRect.top],
      height: cellRect.height,
    };

    if (siblings.length > 0) {
      const before = index < siblings.length;
      const anchor =
        siblings[before ? index : index - 1].getBoundingClientRect();
      const left = before ? anchor.left - gap / 2 : anchor.right + gap / 2;

      marker = { position: [left, anchor.top], height: anchor.height };
    }

    target.current = { row: Number(row.dataset.row), index, marker };
    showInsertionMarker(tierListInsertionMarker.current!, marker);
  }, []);

  const autoScroll = useCallback(() => {
    if (!dragging.current) return;

    const v = pointer.current.y / window.innerHeight;
    let speed = 0;

    if (v <= SCROLL_ZONE) {
      speed = v / SCROLL_ZONE - 1;
    } else if (v >= SCROLL_ZONE_END) {
      speed = 1 - (1 - v) / SCROLL_ZONE;
    }

    const now = performance.now();
    const dt = now - lastFrame.current;
    lastFrame.current = now;

    window.scrollBy({ behavior: "instant", top: speed * dt });

    // The page moves under a still pointer, so the target can change too
    updateTarget();

    requestAnimationFrame(autoScroll);
  }, []);

  const startAutoScroll = useCallback(() => {
    if (!dragging.current) return;

    lastFrame.current = performance.now();
    autoScroll();
  }, []);

  const handlePointerMove = useCallback((event: globalThis.PointerEvent) => {
    event.preventDefault();

    const rect = card.current!.getBoundingClientRect();
    const dx = event.clientX - pointer.current.x;
    const dy = event.clientY - pointer.current.y;

    card.current!.style.left = `${rect.left + dx}px`;
    card.current!.style.top = `${rect.top + dy}px`;

    pointer.current = { x: event.clientX, y: event.clientY };

    updateTarget();
  }, []);

  const handlePointerUp = useCallback(() => {
    updateTarget();

    TierList.mutate((draft) => {
      for (const row of draft.rows) {
        row.tanks = row.tanks.filter((id) => id !== tankId);
      }

      // No target sends the tank back to the pool
      if (target.current === undefined) return;

      draft.rows[target.current.row].tanks.splice(
        target.current.index,
        0,
        tankId!,
      );
    });

    showInsertionMarker(tierListInsertionMarker.current!, undefined);

    delete card.current!.dataset.dragging;
    card.current!.style.removeProperty("left");
    card.current!.style.removeProperty("top");
    card.current!.style.removeProperty("width");

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("scrollend", startAutoScroll);

    dragging.current = false;
    target.current = undefined;
  }, [tankId]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault();

      const rect = card.current!.getBoundingClientRect();

      card.current!.style.left = `${rect.left}px`;
      card.current!.style.top = `${rect.top}px`;
      card.current!.style.width = `${rect.width}px`;
      card.current!.dataset.dragging = "true";

      pointer.current = { x: event.clientX, y: event.clientY };
      dragging.current = true;

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);

      // Edge scrolling only kicks in once the table has been scrolled to
      const table = tierListTable.current!;
      const margin = parseFloat(getComputedStyle(table).scrollMarginTop);
      const distance = table.getBoundingClientRect().top - margin;

      if (Math.abs(distance) < 1 || !("onscrollend" in window)) {
        table.scrollIntoView({ behavior: "instant", block: "start" });
        startAutoScroll();
      } else {
        window.addEventListener("scrollend", startAutoScroll, { once: true });
        table.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [handlePointerUp],
  );

  if (props.skeleton) {
    return <TankCardSkeleton onIntersection={props.onIntersection} />;
  }

  return (
    <div
      ref={card}
      className={styles.tile}
      data-tank-id={props.id}
      onPointerDown={handlePointerDown}
    >
      <TankCard noLink tank={tankDefinitions.tanks[props.id]} />
    </div>
  );
}
