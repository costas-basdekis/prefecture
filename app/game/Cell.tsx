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

export type CellImmutable = Pick<
  Cell,
  | "x"
  | "y"
  | "key"
  | "hasRoad"
  | "buildingId"
  | "canAddBuilding"
  | "waterCoverage"
  | "waterBuildingIds"
> &
  Immutable<Cell>;

export type WaterCoverage = 0 | 1;

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
  @mutable("plainValue")
  waterCoverage: WaterCoverage;
  @mutable("mappedPlainValue")
  waterBuildingIds: number[];

  constructor(grid: Grid, { x, y }: Coords) {
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.key = makeCoordsKey(this);
    this.hasRoad = false;
    this.buildingId = null;
    this.canAddBuilding = true;
    this.waterCoverage = 0;
    this.waterBuildingIds = [];
    this.mutationHelper = new MutationHelper<Cell, CellImmutable>(this);
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

  addWaterCoverage(waterBuilding: WellBuilding): Cell {
    this.waterBuildingIds.push(waterBuilding.id);
    this.waterCoverage = Math.max(
      this.waterCoverage,
      waterBuilding.waterCoverage,
    ) as WaterCoverage;
    this.building?.waterCoverageUpdated?.(this);
    return this;
  }

  addFarm(options: FarmBuildingOptions) {
    this.addBuilding(() => new FarmBuilding(this.grid.game.buildings, options));
  }
}
