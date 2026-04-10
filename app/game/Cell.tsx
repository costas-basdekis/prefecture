import {
  immutable,
  Immutable,
  Mutable,
  mutate,
  MutationHelper,
  parent,
  parentSecondaryKey,
} from "~/immutable";
import { Building, HouseBuilding } from "./buildings";
import { Coords, makeCoordsKey } from "./Coords";
import { Grid } from "./Grid";

export type CellImmutable = Pick<
  Cell,
  "x" | "y" | "key" | "hasRoad" | "buildingId"
> &
  Immutable<Cell>;

export class CellMutationHelper extends MutationHelper<
  Cell,
  CellImmutable,
  { hasRoad: boolean; buildingId: boolean }
> {}

export class Cell implements Mutable<Cell, CellImmutable> {
  mutationHelper: CellMutationHelper;
  @parent("cellMap")
  grid: Grid;
  @immutable
  x: number;
  @immutable
  y: number;
  @immutable
  @parentSecondaryKey
  key: string;
  @mutate("plainValue")
  hasRoad: boolean;
  @mutate("plainValue")
  buildingId: number | null;

  static make(coords: Coords): Cell {
    return new this({
      grid: null,
      ...coords,
      hasRoad: false,
      buildingId: null,
    });
  }

  constructor({
    grid,
    x,
    y,
    hasRoad,
    buildingId,
  }: Pick<Cell, "x" | "y" | "hasRoad" | "buildingId"> & { grid: Grid | null }) {
    this.grid = grid!;
    this.x = x;
    this.y = y;
    this.key = makeCoordsKey(this);
    this.hasRoad = hasRoad;
    this.buildingId = buildingId;
    this.mutationHelper = new CellMutationHelper(this);
  }

  getImmutable(): CellImmutable {
    return this.mutationHelper.getImmutable();
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
    this.buildingId = this.grid.addBuilding(makeBuilding()).id;
    this.mutationHelper.markDirty("buildingId");
    return this;
  }

  addHouse(): Cell {
    return this.addBuilding(() => new HouseBuilding());
  }
}
