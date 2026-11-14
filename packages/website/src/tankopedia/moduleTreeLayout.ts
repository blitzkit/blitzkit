import { ModuleType, type ModulePosition, type Unlock } from "@blitzkit/protos";
import type { Vector2Tuple } from "three";

/**
 * Port of the game client's modules screen layout (wotblitz.exe 11.21,
 * `ModulesTreeInfoCache` auto-layout + `TankModulesTreeController` arrows).
 *
 * Every node lives on one shared grid: depth is the column, and leaves take
 * consecutive rows with each parent centered over its children. Connectors are
 * per-cell flags rather than a nested tree.
 */

// The client sorts siblings by this order: guns, turrets, engines, tracks, tanks
const moduleTypeOrder = [
  ModuleType.MODULE_TYPE_GUN,
  ModuleType.MODULE_TYPE_TURRET,
  ModuleType.MODULE_TYPE_ENGINE,
  ModuleType.MODULE_TYPE_TRACKS,
  ModuleType.MODULE_TYPE_VEHICLE,
];
const moduleTypeRank = new Map(
  moduleTypeOrder.map((type, index) => [type, index])
);

export interface ModuleTreeCell {
  // 1-based grid column (also the depth in the unlock graph) and row
  position: Vector2Tuple;
  // Missing for empty cells that only carry a connector line
  unlock?: Unlock;
  // Arrow entering from the left
  left: boolean;
  // Stub leaving to the right
  right: boolean;
  // Vertical line from the cell center up to the previous row
  trunkUp: boolean;
  // Vertical line from the cell center down to the next row
  trunkDown: boolean;
  // Snake mode: line leaving the top edge with an arrow pointing up
  snakeUp: boolean;
  // Snake mode: line leaving the bottom edge with an arrow pointing down
  snakeDown: boolean;
}

interface Branch {
  unlock: Unlock;
  key: string;
  children: Branch[];
  // Rows this branch spans
  leaves: number;
}

interface Placement {
  unlock: Unlock;
  position: Vector2Tuple;
}

function key(unlock: Unlock) {
  return `${unlock.type}:${unlock.id}`;
}

// Cells are indexed column first, then row
type CellGrid = Map<number, Map<number, ModuleTreeCell>>;

function flattenGrid(grid: CellGrid) {
  return [...grid.values()].flatMap((column) => [...column.values()]);
}

function emptyCell(x: number, y: number) {
  return {
    position: [x, y],
    left: false,
    right: false,
    trunkUp: false,
    trunkDown: false,
    snakeUp: false,
    snakeDown: false,
  } satisfies ModuleTreeCell;
}

/**
 * The client switches to this when any module is bought with something other
 * than xp (season tanks). It ignores the unlock graph past the stock modules
 * and folds the sequence into columns the height of the stock column,
 * alternating direction, with arrows decided purely by position.
 */
function layoutSnake(placements: Placement[]) {
  const ordered = [...placements].sort(
    (a, b) => a.position[0] - b.position[0] || a.position[1] - b.position[1]
  );
  const height = ordered.filter(({ position: [x] }) => x === 1).length;
  const deep = ordered.filter(({ position: [x] }) => x >= 2);

  // The client takes this from whichever deep module sorts last
  const lastOnFirstRow = deep.length > 0 && deep.at(-1)!.position[1] === 1;

  const grid: CellGrid = new Map();

  for (const {
    unlock,
    position: [x, y],
  } of ordered) {
    let column = x;
    let row = y;

    if (x >= 2) {
      const index = x - 2;
      const offset = index % height;

      column = Math.floor(index / height) + 2;
      row =
        ((lastOnFirstRow ? ~column : column) & 1) === 0
          ? height - offset
          : offset + 1;
    }

    let columnCells = grid.get(column);

    if (columnCells === undefined) {
      columnCells = new Map();
      grid.set(column, columnCells);
    }

    columnCells.set(row, { ...emptyCell(column, row), unlock });
  }

  const cells = flattenGrid(grid);
  const width = Math.ceil(ordered.length / height);

  for (const cell of cells) {
    const [column, row] = cell.position;
    const i = column - 1;
    const j = row - 1;
    const down = lastOnFirstRow ? i % 2 === 1 : i % 2 === 0;
    const hasNext = i < width - 1;

    // The first column connects to the tank panel on the page this was
    // modeled on, which doesn't exist here, so nothing enters it from the left
    if (j === 0) {
      cell.left = i > 0 && down;
      cell.right = !down && hasNext;
      cell.snakeDown = down && i > 0;
    } else if (j === height - 1) {
      cell.left = i > 0 && !down;
      cell.right = down && hasNext;
      cell.snakeUp = !down && i > 0;
    } else {
      cell.snakeUp = !down && i > 0;
      cell.snakeDown = down && i > 0;
    }
  }

  let columns = width;
  let rows = height;

  for (const cell of cells) {
    columns = Math.max(columns, cell.position[0]);
    rows = Math.max(rows, cell.position[1]);
  }

  return { cells, columns, rows };
}

function sortSiblings(unlocks: Unlock[]) {
  return [...unlocks].sort(
    (a, b) =>
      (moduleTypeRank.get(a.type) ?? -1) - (moduleTypeRank.get(b.type) ?? -1)
  );
}

/**
 * @param positions hand-authored cells for this tank. When given, the client
 * places exactly those modules and hides the rest instead of running the
 * automatic layout.
 */
export function layoutModuleTree(
  roots: Unlock[],
  getChildren: (unlock: Unlock) => Unlock[],
  positions: ModulePosition[] = []
) {
  const authored =
    positions.length === 0
      ? undefined
      : new Map<string, Vector2Tuple>(
          positions.map(({ type, id, position }) => [
            `${type}:${id}`,
            [position!.x, position!.y],
          ])
        );

  // A module's subtree doesn't depend on which parent reached it, so each one
  // is grown once instead of once per path through the unlock graph
  const branches = new Map<string, Branch>();

  // Recursive, so the return type can't be inferred
  const grow = (unlock: Unlock): Branch => {
    const unlockKey = key(unlock);
    const cached = branches.get(unlockKey);

    if (cached !== undefined) return cached;

    const children = sortSiblings(getChildren(unlock)).map(grow);
    const branch = {
      unlock,
      key: unlockKey,
      children,
      leaves:
        children.length === 0
          ? 1
          : children.reduce((total, child) => total + child.leaves, 0),
    } satisfies Branch;

    branches.set(unlockKey, branch);

    return branch;
  };

  // A module unlocked from several parents is laid out once per parent and the
  // last placement wins, same as the client
  const placements = new Map<string, Placement>();
  // Keyed by both ends so shared subtrees don't repeat their connectors
  const edges = new Map<string, [parent: string, child: string]>();
  let isSnake = false;

  const place = (branch: Branch, depth: number, startRow: number) => {
    const position =
      authored === undefined
        ? ([
            depth,
            Math.floor((branch.leaves - 1) / 2) + startRow,
          ] as Vector2Tuple)
        : authored.get(branch.key);

    if (position !== undefined) {
      const { unlock } = branch;

      placements.set(branch.key, { unlock, position });

      if (unlock.cost !== undefined && unlock.cost.type !== "xp") {
        isSnake = true;
      }
    }

    let row = startRow;

    for (const child of branch.children) {
      place(child, depth + 1, row);
      edges.set(`${branch.key}>${child.key}`, [branch.key, child.key]);
      row += child.leaves;
    }
  };

  // The tank itself is the invisible root at depth 0
  let row = 1;

  for (const branch of sortSiblings(roots).map(grow)) {
    place(branch, 1, row);
    row += branch.leaves;
  }

  if (isSnake) return layoutSnake([...placements.values()]);

  const grid: CellGrid = new Map();
  let columns = 0;
  let rows = 0;

  const cellAt = (x: number, y: number) => {
    let columnCells = grid.get(x);

    if (columnCells === undefined) {
      columnCells = new Map();
      grid.set(x, columnCells);
    }

    let cell = columnCells.get(y);

    if (cell === undefined) {
      cell = emptyCell(x, y);
      columnCells.set(y, cell);
      columns = Math.max(columns, x);
      rows = Math.max(rows, y);
    }

    return cell;
  };

  for (const {
    unlock,
    position: [x, y],
  } of placements.values()) {
    cellAt(x, y).unlock = unlock;
  }

  for (const [parentKey, childKey] of edges.values()) {
    const parent = placements.get(parentKey);
    const child = placements.get(childKey);

    // Unplaced modules are hidden, and so are the connectors touching them
    if (parent === undefined || child === undefined) continue;

    const [, parentRow] = parent.position;
    const [childColumn, childRow] = child.position;

    cellAt(...parent.position).right = true;
    cellAt(...child.position).left = true;

    // The vertical bus runs in the gap left of the child's column, through
    // empty cells where it has to
    const top = Math.min(parentRow, childRow);
    const bottom = Math.max(parentRow, childRow);

    for (let y = top; y <= bottom; y++) {
      const cell = cellAt(childColumn, y);

      if (y > top) cell.trunkUp = true;
      if (y < bottom) cell.trunkDown = true;
    }
  }

  return { cells: flattenGrid(grid), columns, rows };
}
