import { Cell } from "./Cell";

export class CellSearch {
  start: Cell;
  end: Cell;
  seenCells: Set<Cell>;
  nextCells: Cell[];
  previousMap: Map<Cell, Cell>;
  path: Cell[] | null;

  static search(start: Cell, end: Cell): Cell[] | null {
    return new this(start, end).search();
  }

  constructor(start: Cell, end: Cell) {
    if (!start.hasRoad || !end.hasRoad) {
      throw new Error(`Start or end are not roads`);
    }
    this.start = start;
    this.end = end;
    this.seenCells = new Set([start]);
    this.nextCells = [start];
    this.previousMap = new Map();
    this.path = null;
  }

  search(): Cell[] | null {
    if (this.path || !this.nextCells.length) {
      return this.path;
    }
    while (this.nextCells.length) {
      if (this.seenCells.has(this.end)) {
        break;
      }
      const nextCellsAndPrevious = this.nextCells
        .flatMap((cell) =>
          cell.getAdjacentRoads().map((nextCell) => [nextCell, cell]),
        )
        .filter(([nextCell]) => !this.seenCells.has(nextCell));
      for (const [nextCell, cell] of nextCellsAndPrevious) {
        this.seenCells.add(nextCell);
        this.previousMap.set(nextCell, cell);
      }
      this.nextCells = nextCellsAndPrevious.map(([nextCell]) => nextCell);
    }
    if (!this.seenCells.has(this.end)) {
      return null;
    }
    const path: Cell[] = [this.end];
    while (path[0] !== this.start) {
      const cell = path[0];
      const previousCell = this.previousMap.get(cell);
      if (!previousCell) {
        throw new Error(
          `Bug in creating path after searching:\n` +
            `Seen are ${Array.from(this.seenCells)
              .map((cell) => `(${cell.key})`)
              .join(", ")}\n` +
            `Previous map is ${Array.from(this.previousMap.entries()).map(([previous, next]) => `${previous.key}:${next.key}`)}\n` +
            `Current is ${cell}\n` +
            `Path so far is ${path.map((cell) => cell.key)}`,
        );
      }
      path.splice(0, 0, previousCell);
    }
    this.path = path;
    return this.path;
  }
}
