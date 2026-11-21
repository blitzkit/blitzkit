import type { Vector2Tuple } from "three";

// A sparse grid that grows to fit whatever is placed on it, shared by the
// module and augment trees. Cells are indexed column first, then row
export class CellGrid<Cell extends { position: Vector2Tuple }> {
  private readonly columnCells = new Map<number, Map<number, Cell>>();
  // Highest 1-based column and row anything has been placed at
  columns = 0;
  rows = 0;

  constructor(
    private readonly createCell: (column: number, row: number) => Cell,
  ) {}

  // An arrow, so it can be pulled off the grid and called on its own
  cellAt = (column: number, row: number) => {
    let cells = this.columnCells.get(column);

    if (cells === undefined) {
      cells = new Map();
      this.columnCells.set(column, cells);
    }

    let cell = cells.get(row);

    if (cell === undefined) {
      cell = this.createCell(column, row);
      cells.set(row, cell);
      this.columns = Math.max(this.columns, column);
      this.rows = Math.max(this.rows, row);
    }

    return cell;
  };

  cells() {
    return [...this.columnCells.values()].flatMap((cells) => [
      ...cells.values(),
    ]);
  }
}
