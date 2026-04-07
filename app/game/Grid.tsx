import lodash from "lodash";
import { Cell } from "./Cell";
import { Coords, makeCoordsKey } from "./Coords";

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

  upgradeCells(cellsOrCellMap: Cell[] | Record<string, Cell>): Grid {
    let cellMap;
    if (Array.isArray(cellsOrCellMap)) {
      const cells = cellsOrCellMap;
      cellMap = Object.fromEntries(cells.map((cell) => [cell.key, cell]));
    } else {
      cellMap = cellsOrCellMap;
    }
    const newCellMap = {
      ...this.cellMap,
      ...cellMap,
    };
    return new Grid(newCellMap, this.width, this.height);
  }

  addRoads(allCoords: Coords[]): Grid {
    return this.upgradeCells(
      allCoords.map((coords) => this.cellMap[makeCoordsKey(coords)].addRoad()),
    );
  }
}
