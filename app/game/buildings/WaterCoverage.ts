import { Cell } from "../Cell";
import { OnEvent } from "../events";
import { Grid } from "../Grid";
import { WellBuilding } from "./WellBuilding";

export type WaterCoverageLevel = 0 | 1;
export type WaterBuilding = WellBuilding;

export class WaterCoverage {
  grid: Grid;
  byCell: Map<Cell, CellWaterCoverage>;

  constructor(grid: Grid) {
    this.grid = grid;
    this.byCell = new Map(
      this.grid.cells.map((cell) => [cell, new CellWaterCoverage(this, cell)]),
    );
  }

  add(waterBuilding: WaterBuilding, cellOrCells: Cell | Iterable<Cell>) {
    let cells;
    if (cellOrCells instanceof Cell) {
      cells = [cellOrCells];
    } else {
      cells = cellOrCells;
    }
    for (const cell of cells) {
      this.byCell.get(cell)!.add(waterBuilding);
    }
  }

  get(cell: Cell): CellWaterCoverage {
    return this.byCell.get(cell)!;
  }

  registerOnLevelUpdated(
    callback: Parameters<CellWaterCoverage["onLevelUpdated"]["register"]>[0],
    cellOrCells: Cell | Iterable<Cell>,
  ) {
    let cells;
    if (cellOrCells instanceof Cell) {
      cells = [cellOrCells];
    } else {
      cells = cellOrCells;
    }
    for (const cell of cells) {
      this.get(cell).onLevelUpdated.register(callback);
    }
  }
}

export class CellWaterCoverage {
  waterCoverage: WaterCoverage;
  cell: Cell;
  level: WaterCoverageLevel = 0;
  waterBuildings: WaterBuilding[] = [];

  onLevelUpdated = new OnEvent<(waterCoverage: CellWaterCoverage) => void>();

  constructor(waterCoverage: WaterCoverage, cell: Cell) {
    this.waterCoverage = waterCoverage;
    this.cell = cell;
  }

  add(waterBuilding: WaterBuilding) {
    const newLevel = Math.max(
      this.level,
      waterBuilding.waterCoverage,
    ) as WaterCoverageLevel;
    if (newLevel !== this.level) {
      this.level = newLevel;
      this.onLevelUpdated.trigger(this);
    }
    this.waterBuildings.push(waterBuilding);
  }
}
