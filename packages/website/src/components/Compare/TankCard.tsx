import { type TankDefinition, tankIcon } from "@blitzkit/core";
import { Flex, Text } from "@radix-ui/themes";
import { useEffect, useRef } from "react";
import { Vector2 } from "three";
import { useLocale } from "../../hooks/useLocale";
import { CompareEphemeral } from "../../stores/compareEphemeral";
import { StickyColumnHeaderCell } from "../StickyColumnHeaderCell";
import { InsertionMarker } from "./IntersectionMarker";
import { insertionMarkers } from "./IntersectionMarker/constants";
import { TankControl } from "./TankControl";

interface TankCardProps {
  index: number;
  tank: TankDefinition;
}

export function TankCard({ index, tank }: TankCardProps) {
  const draggable = useRef<HTMLDivElement>(null);
  const { unwrap } = useLocale();

  useEffect(() => {
    const initial = new Vector2();
    const current = new Vector2();
    const delta = new Vector2();
    const marker = new Vector2();
    let initialRect = draggable.current!.getBoundingClientRect();
    let dropIndex = -1;

    function handlePointerDown(event: PointerEvent) {
      event.preventDefault();

      initialRect = draggable.current!.getBoundingClientRect();

      delta.set(0, 0);
      current.copy(initial.set(event.clientX, event.clientY));
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    function handlePointerMove(event: PointerEvent) {
      event.preventDefault();

      current.set(event.clientX, event.clientY);
      delta.copy(current).sub(initial);
      insertionMarkers.forEach(({ element }) => {
        element.style.opacity = "0";
      });

      const distances = insertionMarkers.map((insertionMarker) => {
        const markerBounds = insertionMarker.element.getBoundingClientRect();
        marker.set(markerBounds.left, markerBounds.top);

        return {
          ...insertionMarker,
          distance: marker.distanceTo(current),
        };
      });
      const closest = distances.reduce((a, b) =>
        a.distance < b.distance ? a : b
      );

      dropIndex = closest.index;
      closest.element.style.opacity = "1";
      draggable.current!.style.position = "fixed";
      draggable.current!.style.cursor = "grabbing";
      draggable.current!.style.zIndex = "1";
      draggable.current!.style.left = `${initialRect.left + delta.x}px`;
      draggable.current!.style.top = `${initialRect.top + delta.y}px`;
    }
    function handlePointerUp(event: PointerEvent) {
      event.preventDefault();

      draggable.current!.style.position = "static";
      draggable.current!.style.zIndex = "unset";
      draggable.current!.style.cursor = "grab";

      insertionMarkers.forEach(({ element }) => {
        element.style.opacity = "0";
      });

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
  }, []);

  return (
    <StickyColumnHeaderCell>
      <Flex direction="column" align="center" justify="between" gap="2">
        <TankControl index={index} key={tank.id} slug={tank.slug} />

        <Flex
          ref={draggable}
          direction="column"
          align="center"
          justify="between"
          gap="2"
          style={{
            userSelect: "none",
            touchAction: "none",
            cursor: "grab",
          }}
        >
          <img
            alt={unwrap(tank.name)}
            src={tankIcon(tank.id)}
            width={64}
            height={64}
            draggable={false}
            style={{
              objectFit: "contain",
            }}
          />

          <Text
            style={{
              whiteSpace: "nowrap",
              maxWidth: 128,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {unwrap(tank.name)}
          </Text>
        </Flex>
      </Flex>

      <InsertionMarker index={index + 1} />
    </StickyColumnHeaderCell>
  );
}
