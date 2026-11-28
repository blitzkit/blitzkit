import { tankIcon } from "@blitzkit/core";
import type { TankDefinition } from "@blitzkit/protos";
import { useEffect, useRef } from "react";
import { Vector2 } from "three";
import { compareInsertionMarker } from "../../config/compare";
import { showInsertionMarker } from "../../core/blitzkit/showInsertionMarker";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { CompareEphemeral } from "../../stores/compareEphemeral";
import { CompareTankControl } from "../CompareTankControl";
import { LazyImage } from "../LazyImage";
import { Table } from "../Table";
import { Text } from "../Text";
import styles from "./index.module.css";

interface TankCardProps {
  index: number;
  tank: TankDefinition;
}

export function CompareTankCard({ index, tank }: TankCardProps) {
  const header = useRef<HTMLTableCellElement>(null);
  const draggable = useRef<HTMLDivElement>(null);
  const unwrap = useUnwrapper();

  useEffect(() => {
    const initial = new Vector2();
    const offset = new Vector2();
    let initialRect = draggable.current!.getBoundingClientRect();
    let dropIndex = -1;

    function handlePointerDown(event: PointerEvent) {
      event.preventDefault();

      initialRect = draggable.current!.getBoundingClientRect();
      initial.set(event.clientX, event.clientY);

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    function handlePointerMove(event: PointerEvent) {
      event.preventDefault();

      // Slot i sits on the right edge of the row's i-th cell: the corner, then each card
      const cells = header.current!.parentElement!.children;
      let closestRect = cells[0].getBoundingClientRect();
      let closestDistance = Infinity;

      for (let cell = 0; cell < cells.length; cell++) {
        const rect = cells[cell].getBoundingClientRect();
        const distance = Math.abs(rect.right - event.clientX);

        if (distance >= closestDistance) continue;

        dropIndex = cell;
        closestRect = rect;
        closestDistance = distance;
      }

      showInsertionMarker(compareInsertionMarker.current!, {
        position: [closestRect.right, closestRect.top],
        height: closestRect.height,
      });
      header.current!.dataset.dragging = "true";
      offset.set(event.clientX, event.clientY).sub(initial);
      draggable.current!.style.left = `${initialRect.left + offset.x}px`;
      draggable.current!.style.top = `${initialRect.top + offset.y}px`;
    }
    function handlePointerUp(event: PointerEvent) {
      event.preventDefault();

      delete header.current!.dataset.dragging;
      showInsertionMarker(compareInsertionMarker.current!, undefined);

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      if (dropIndex === -1) return;

      CompareEphemeral.mutate((draft) => {
        const fromIndex = index;
        const toIndex = dropIndex > index ? dropIndex - 1 : dropIndex;
        const member = draft.members[fromIndex];

        draft.members.splice(fromIndex, 1);
        draft.members.splice(toIndex, 0, member);
      });

      dropIndex = -1;
    }

    draggable.current?.addEventListener("pointerdown", handlePointerDown);

    return () => {
      draggable.current?.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [index]);

  return (
    <Table.ColumnHeader ref={header} className={styles.card}>
      <div className={styles.content}>
        <CompareTankControl index={index} key={tank.id} slug={tank.slug} />

        <div ref={draggable} className={styles.draggable}>
          <LazyImage
            alt={unwrap(tank.name!)}
            src={tankIcon(tank.id)}
            width={64}
            height={64}
            draggable={false}
            className={styles.icon}
          />

          <Text className={styles.name}>{unwrap(tank.name!)}</Text>
        </div>
      </div>
    </Table.ColumnHeader>
  );
}
