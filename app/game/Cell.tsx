import { Building, HouseBuilding } from "./buildings";
import { Coords, makeCoordsKey } from "./Coords";
import { Grid } from "./Grid";

export type CellImmutable = Pick<
  Cell,
  "x" | "y" | "key" | "hasRoad" | "buildingId"
> & { _mutable: Cell };

export class CellMutationHelper {
  mutable: Cell;
  dirty: boolean;
  dirtyKeys: { hasRoad: boolean; buildingId: boolean };
  lastImmutable: CellImmutable;

  constructor(mutable: Cell) {
    this.mutable = mutable;
    this.dirty = false;
    this.dirtyKeys = { hasRoad: false, buildingId: false };
    this.lastImmutable = {
      _mutable: mutable,
      x: mutable.x,
      y: mutable.y,
      key: mutable.key,
      hasRoad: mutable.hasRoad,
      buildingId: mutable.buildingId,
    };
  }

  markDirty(key: keyof CellMutationHelper["dirtyKeys"]) {
    this.dirtyKeys[key] = true;
    this.dirty = true;
    this.mutable.grid.mutationHelper.markDirty(this.mutable.key);
  }

  getImmutable(): CellImmutable {
    return this.updateImmutable();
  }

  updateImmutable(): CellImmutable {
    if (this.dirty) {
      this.lastImmutable = {
        ...this.lastImmutable,
      };
      if (this.dirtyKeys.hasRoad) {
        this.lastImmutable.hasRoad = this.mutable.hasRoad;
        this.dirtyKeys.hasRoad = false;
      }
      if (this.dirtyKeys.buildingId) {
        this.lastImmutable.buildingId = this.mutable.buildingId;
        this.dirtyKeys.buildingId = false;
      }
      this.dirty = false;
    }
    return this.lastImmutable;
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
