import {
  immutable,
  Immutable,
  Mutable,
  mutable,
  MutationHelper,
  parentKey,
  parentSecondaryKey,
} from "~/immutable";
import {
  Building,
  FarmBuilding,
  FarmBuildingOptions,
  HouseBuilding,
  HouseOptions,
  WellBuilding,
  WellOptions,
} from "./buildings";
import { Coords, makeCoordsKey } from "./Coords";
import type { Grid } from "./Grid";
import { propById } from "~/utils";
import _ from "lodash";
import { CellSearch } from "./CellSearch";
import { CellWaterCoverage } from "./buildings/WaterCoverage";

export type CellImmutable = Pick<
  Cell,
  "x" | "y" | "key" | "hasRoad" | "buildingId" | "canAddBuilding"
> &
  Immutable<Cell>;

export class Cell implements Mutable<Cell, CellImmutable> {
  mutationHelper: MutationHelper<Cell, CellImmutable>;
  @parentKey("cellMap")
  grid: Grid;
  @immutable
  x: number;
  @immutable
  y: number;
  @immutable
  @parentSecondaryKey
  key: string;
  @mutable("plainValue")
  hasRoad: boolean;
  @mutable("plainValue")
  buildingId: number | null;
  @propById(
    "buildingId",
    (id: number, thisObject: Cell) => thisObject.grid.game.buildings.byId[id],
  )
  declare building: Building | null;
  @mutable("plainValue")
  canAddBuilding: boolean;

  constructor(grid: Grid, { x, y }: Coords) {
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.key = makeCoordsKey(this);
    this.hasRoad = false;
    this.buildingId = null;
    this.canAddBuilding = true;
    this.mutationHelper = new MutationHelper<Cell, CellImmutable>(this);
  }

  *getCellsAround(
    dX: number,
    dY: number,
    includeSelf: boolean = true,
    topLeft: Coords = this,
    bottomRight: Coords = this,
    allCells: Cell[] = [this],
  ): Iterable<Cell> {
    const seenCells = includeSelf ? null : new Set<Cell>(allCells);
    for (const x of _.range(topLeft.x - dX, bottomRight.x + dX + 1)) {
      for (const y of _.range(topLeft.y - dY, bottomRight.y + dY + 1)) {
        const cell = this.grid.cellMap[makeCoordsKey({ x, y })];
        if (!cell) {
          continue;
        }
        if (seenCells && seenCells.has(cell)) {
          continue;
        }
        yield cell;
        if (seenCells) {
          seenCells.add(cell);
        }
      }
    }
  }

  getAdjacentRoads(): Cell[] {
    return this.getAdjacentCells().filter((cell) => cell.hasRoad);
  }

  getAdjacentCells(): Cell[] {
    return [
      { x: this.x - 1, y: this.y },
      { x: this.x + 1, y: this.y },
      { x: this.x, y: this.y - 1 },
      { x: this.x, y: this.y + 1 },
    ]
      .map((coords) => this.grid.cellMap[makeCoordsKey(coords)])
      .filter((cell) => cell);
  }

  getPathFrom(cell: Cell): Cell[] | null {
    return CellSearch.search(cell, this);
  }

  addRoad(): Cell {
    if (!this.canAddBuilding) {
      return this;
    }
    this.hasRoad = true;
    this.canAddBuilding = false;
    return this;
  }

  addBuilding(makeBuilding: () => Building): Cell {
    if (!this.canAddBuilding) {
      return this;
    }
    this.building = makeBuilding();
    this.canAddBuilding = false;
    return this;
  }

  addHouse(houseOptions: HouseOptions): Cell {
    return this.addBuilding(
      () => new HouseBuilding(this.grid.game.buildings, houseOptions),
    );
  }

  addWell(options: WellOptions): Cell {
    return this.addBuilding(
      () => new WellBuilding(this.grid.game.buildings, options),
    );
  }

  get waterCoverage(): CellWaterCoverage {
    return this.grid.waterCoverage.get(this);
  }

  addFarm(options: FarmBuildingOptions) {
    this.addBuilding(() => new FarmBuilding(this.grid.game.buildings, options));
  }
}
