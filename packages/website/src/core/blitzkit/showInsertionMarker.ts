import type { Vector2Tuple } from "three";

// The full span of the slot; the marker pads itself inwards
export interface InsertionMarkerPlacement {
  position: Vector2Tuple;
  height: number;
}

// Undefined hides the marker
// TODO: go through core/ and dissolve every file
export function showInsertionMarker(
  marker: HTMLDivElement,
  placement: InsertionMarkerPlacement | undefined,
) {
  if (placement === undefined) {
    delete marker.dataset.visible;
    return;
  }

  marker.dataset.visible = "true";
  marker.style.left = `${placement.position[0]}px`;
  marker.style.top = `${placement.position[1]}px`;
  marker.style.height = `${placement.height}px`;
}
