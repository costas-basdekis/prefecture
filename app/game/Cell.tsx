import { Immutable, Mutable, mutate, MutationHelper } from "~/immutable";
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
> {
  getInitialDirtyKeys() {
    return { hasRoad: false, buildingId: false };
  }

  getInitialLastImmutable() {
    return {
      _mutable: this.mutable,
      x: this.mutable.x,
      y: this.mutable.y,
      key: this.mutable.key,
      hasRoad: this.getForPlainValue("hasRoad"),
      buildingId: this.getForPlainValue("buildingId"),
    };
  }

  markDirty(...keys: (keyof CellMutationHelper["dirtyKeys"])[]) {
    super.markDirty(...keys);
    this.mutable.grid.mutationHelper.markDirty(["cellMap", this.mutable.key]);
  }
}

export class Cell implements Mutable<Cell, CellImmutable> {
  mutationHelper: CellMutationHelper;
  grid: Grid;
  x: number;
  y: number;
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
