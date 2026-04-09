import { MutationHelper } from "~/immutable";
import { Building, HouseBuilding } from "./buildings";
import { Coords, makeCoordsKey } from "./Coords";
import { Grid } from "./Grid";

export type CellImmutable = Pick<
  Cell,
  "x" | "y" | "key" | "hasRoad" | "buildingId"
> & { _mutable: Cell };

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
      hasRoad: this.mutable.hasRoad,
      buildingId: this.mutable.buildingId,
    };
  }

  markDirty(key: keyof CellMutationHelper["dirtyKeys"]) {
    super.markDirty(key);
    this.mutable.grid.mutationHelper.markDirty(this.mutable.key);
  }

  updateImmutableDirtyKeys() {
    if (this.dirtyKeys.hasRoad) {
      this.lastImmutable.hasRoad = this.mutable.hasRoad;
      this.dirtyKeys.hasRoad = false;
    }
    if (this.dirtyKeys.buildingId) {
      this.lastImmutable.buildingId = this.mutable.buildingId;
      this.dirtyKeys.buildingId = false;
    }
  }
}

export class Cell {
  mutationHelper: CellMutationHelper;
  grid: Grid;
  x: number;
  y: number;
  key: string;
  hasRoad: boolean;
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

  getImmutalbe(): CellImmutable {
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
