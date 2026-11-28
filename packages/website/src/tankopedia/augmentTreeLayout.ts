import type {
  AugmentGroup,
  AugmentNode,
  AugmentProgression,
  AugmentRequirement,
} from "@blitzkit/protos";
import type { Vector2Tuple } from "three";
import { CellGrid } from "./cellGrid";

/**
 * Follows how the game routes the connectors of its augment tree.
 *
 * Every node is placed by hand on a shared grid and the connectors are
 * per-cell flags, same as the modules screen. Each requirement becomes an
 * edge that is routed along one row and one column, never diagonally. The
 * game's arrowheads are left out, the same as on the modules screen.
 */

export interface AugmentTreeCell {
  // 1-based grid column (depth) and row
  position: Vector2Tuple;
  // Missing for empty cells that only carry a connector line
  node?: AugmentNode;
  // The final choice every branch ends in. Takes the cell its edges point at
  group?: AugmentGroup;
  // Line from the cell center to the left
  left: boolean;
  // Line from the cell center to the right
  right: boolean;
  // Line from the cell center up to the previous row
  top: boolean;
  // Line from the cell center down to the next row
  bottom: boolean;
}

// A cell as the website shows it. The game lays the tree out left to right
// and the website top to bottom, so the game's depth becomes the row
export interface AugmentTreeDisplayCell {
  // 1-based grid row (depth) and column
  row: number;
  column: number;
  node?: AugmentNode;
  group?: AugmentGroup;
  north: boolean;
  south: boolean;
  west: boolean;
  east: boolean;
}

// Source row and column, then target row and column
type Edge = readonly [
  fromRow: number,
  fromColumn: number,
  toRow: number,
  toColumn: number,
  verticalFirst: boolean,
];

function emptyCell(column: number, row: number) {
  return {
    position: [column, row],
    left: false,
    right: false,
    top: false,
    bottom: false,
  } satisfies AugmentTreeCell;
}

export function layoutAugmentTree({ nodes, group }: AugmentProgression) {
  // Only placed nodes can have a line drawn from them
  const byTechName = new Map(
    nodes
      .filter((node) => node.position !== undefined)
      .map((node) => [node.tech_name, node]),
  );
  const edges: Edge[] = [];

  const connect = (
    requires: AugmentRequirement[],
    toRow: number,
    toColumn: number,
  ) => {
    for (const { tech_name, vertical_first } of requires) {
      // Nothing to draw from a node the tank doesn't have
      if (!byTechName.has(tech_name)) continue;

      const from = byTechName.get(tech_name)!.position!;

      edges.push([from.y, from.x, toRow, toColumn, vertical_first]);
    }
  };

  for (const node of nodes) {
    if (node.position === undefined) continue;

    connect(node.requires, node.position.y, node.position.x);
  }

  if (group !== undefined) {
    connect(group.requires, group.position!.y, group.position!.x);
  }

  const grid = new CellGrid<AugmentTreeCell>(emptyCell);
  const { cellAt } = grid;

  for (const node of nodes) {
    if (node.position !== undefined) {
      cellAt(node.position.x, node.position.y).node = node;
    }
  }

  if (group !== undefined) {
    cellAt(group.position!.x, group.position!.y).group = group;
  }

  // Cells strictly between two ends, which stay untouched here
  const runHorizontally = (row: number, from: number, to: number) => {
    const step = from < to ? 1 : -1;

    for (let column = from + step; column !== to; column += step) {
      const cell = cellAt(column, row);

      cell.left = true;
      cell.right = true;
    }
  };

  const runVertically = (column: number, from: number, to: number) => {
    const step = from < to ? 1 : -1;

    for (let row = from + step; row !== to; row += step) {
      const cell = cellAt(column, row);

      cell.top = true;
      cell.bottom = true;
    }
  };

  // Where a run turns, joining the vertical and horizontal pieces
  const corner = (
    row: number,
    column: number,
    otherRow: number,
    otherColumn: number,
  ) => {
    const cell = cellAt(column, row);

    if (row <= otherRow) cell.bottom = true;
    else cell.top = true;

    if (column <= otherColumn) cell.right = true;
    else cell.left = true;
  };

  // Attaches the line to both nodes
  const attach = (
    fromRow: number,
    fromColumn: number,
    toRow: number,
    toColumn: number,
    verticalFirst: boolean,
  ) => {
    const from = cellAt(fromColumn, fromRow);
    const to = cellAt(toColumn, toRow);

    if (fromColumn === toColumn) {
      if (fromRow < toRow) {
        from.bottom = true;
        to.top = true;
      } else {
        from.top = true;
        to.bottom = true;
      }
    } else if (fromRow === toRow) {
      if (toColumn <= fromColumn) {
        from.left = true;
        to.right = true;
      } else {
        from.right = true;
        to.left = true;
      }
    } else if (verticalFirst) {
      if (fromRow < toRow) from.bottom = true;
      else from.top = true;

      if (toColumn <= fromColumn) to.right = true;
      else to.left = true;
    } else {
      if (fromColumn < toColumn) from.right = true;
      else from.left = true;

      if (fromRow < toRow) to.top = true;
      else to.bottom = true;
    }
  };

  for (const [fromRow, fromColumn, toRow, toColumn, verticalFirst] of edges) {
    // The client draws nothing for an edge that starts where it ends
    if (fromRow === toRow && fromColumn === toColumn) continue;

    // Touching ends are left to `attach`
    if (fromRow === toRow) {
      if (fromColumn !== toColumn)
        runHorizontally(fromRow, fromColumn, toColumn);
    } else if (fromColumn === toColumn) {
      runVertically(fromColumn, fromRow, toRow);
    } else if (verticalFirst) {
      // Down the source column, then along the target row
      runVertically(fromColumn, fromRow, toRow);
      corner(toRow, fromColumn, fromRow, toColumn);
      runHorizontally(toRow, fromColumn, toColumn);
    } else {
      // Along the source row, then down the target column
      runHorizontally(fromRow, fromColumn, toColumn);
      corner(fromRow, toColumn, toRow, fromColumn);
      runVertically(toColumn, fromRow, toRow);
    }

    attach(fromRow, fromColumn, toRow, toColumn, verticalFirst);
  }

  return {
    cells: grid.cells().map(
      ({ position: [column, row], node, group, left, right, top, bottom }) =>
        ({
          row: column,
          column: row,
          node,
          group,
          north: left,
          south: right,
          west: top,
          east: bottom,
        } satisfies AugmentTreeDisplayCell),
    ),
    rows: grid.columns,
    columns: grid.rows,
  };
}
