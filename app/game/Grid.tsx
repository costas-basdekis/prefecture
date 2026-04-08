import lodash from "lodash";
import { Cell } from "./Cell";
import { Coords, makeCoordsKey } from "./Coords";

export interface GridMakeOptions {
  width: number;
  height: number;
}

export class Grid {
  cellMap: Record<string, Cell>;
  width: number;
  height: number;
  nextBuildingId: number;

  static make({ width, height }: GridMakeOptions): Grid {
    return new this({
      cellMap: Object.fromEntries(
        lodash
          .range(height)
          .flatMap((y) => lodash.range(width).map((x) => Cell.make({ x, y })))
          .map((cell) => [cell.key, cell] as const),
      ),
      width,
      height,
      nextBuildingId: 0,
    });
  }

  constructor({
    cellMap,
    width,
    height,
    nextBuildingId,
  }: {
    cellMap: Record<string, Cell>;
    width: number;
    height: number;
    nextBuildingId: number;
  }) {
    this.cellMap = cellMap;
    this.width = width;
    this.height = height;
    this.nextBuildingId = nextBuildingId;
  }

  get cells(): Cell[] {
    return Object.values(this.cellMap);
  }

  upgradeCells(
    cellsOrCellMap: Cell[] | Record<string, Cell>,
    nextBuildingId: number = this.nextBuildingId,
  ): Grid {
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
    return new Grid({
      cellMap: newCellMap,
      width: this.width,
      height: this.height,
      nextBuildingId,
    });
  }

  addRoads(allCoords: Coords[]): Grid {
    return this.upgradeCells(
      allCoords.map((coords) => this.cellMap[makeCoordsKey(coords)].addRoad()),
    );
  }

  addHouses(allCoords: Coords[]): Grid {
    let nextBuildingId = this.nextBuildingId;
    function getNextBuildingId(): number {
      const buildingId = nextBuildingId;
      nextBuildingId++;
      return buildingId;
    }
    const cells = allCoords.map((coords) =>
      this.cellMap[makeCoordsKey(coords)].addHouse(getNextBuildingId),
    );
    return this.upgradeCells(cells, nextBuildingId);
  }
}
