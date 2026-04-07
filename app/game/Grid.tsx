import lodash from "lodash";
import { Cell } from "./Cell";

export class Grid {
  cellMap: Record<string, Cell>;
  width: number;
  height: number;

  static make({ width, height }: { width: number; height: number }): Grid {
    return new this(
      Object.fromEntries(
        lodash
          .range(height)
          .flatMap((y) => lodash.range(width).map((x) => Cell.make({ x, y })))
          .map((cell) => [cell.key, cell] as const),
      ),
      width,
      height,
    );
  }

  constructor(cellMap: Record<string, Cell>, width: number, height: number) {
    this.cellMap = cellMap;
    this.width = width;
    this.height = height;
  }

  get cells(): Cell[] {
    return Object.values(this.cellMap);
  }
}
