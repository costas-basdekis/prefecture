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
  HouseBuilding,
  HouseOptions,
  WellBuilding,
  WellOptions,
} from "./buildings";
import { Coords, makeCoordsKey } from "./Coords";
import type { Grid } from "./Grid";

export type CellImmutable = Pick<
  Cell,
  | "x"
  | "y"
  | "key"
  | "hasRoad"
  | "buildingId"
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
    this.waterCoverage = 0;
    this.waterBuildingIds = [];
    this.mutationHelper = new MutationHelper<Cell, CellImmutable>(this);
  }

  get building(): Building | null {
    if (!this.buildingId) {
      return null;
    }
    return this.grid.game.buildings.byId[this.buildingId];
  }

  set building(building: Building | null) {
    const buildingId = building?.id ?? null;
    if (this.buildingId !== buildingId) {
      this.buildingId = buildingId;
      this.mutationHelper.markDirty("buildingId");
    }
  }

  addRoad(): Cell {
    if (this.hasRoad) {
      return this;
    }
    if (this.buildingId) {
      return this;
    }
    this.hasRoad = true;
    this.mutationHelper.markDirty("hasRoad");
    return this;
  }

  addBuilding(makeBuilding: () => Building): Cell {
    if (this.hasRoad) {
      return this;
    }
    if (this.buildingId) {
      return this;
    }
    this.building = makeBuilding();
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
    this.mutationHelper.markDirty("waterCoverage", "waterBuildingIds");
    this.building?.waterCoverageUpdated?.(this);
    return this;
  }
}
