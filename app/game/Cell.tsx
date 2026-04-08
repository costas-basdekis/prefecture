import { Building, HouseBuilding } from "./buildings";
import { Coords, makeCoordsKey } from "./Coords";
import { Grid } from "./Grid";

export type CellImmutable = Pick<
  Cell,
  "x" | "y" | "key" | "hasRoad" | "buildingId" | "addRoad" | "addBuilding"
>;

export class Cell {
  grid: Grid;
  x: number;
  y: number;
  key: string;
  hasRoad: boolean;
  buildingId: number | null;
  _dirty: boolean;
  _dirtyKeys: { hasRoad: boolean; buildingId: boolean };
  _lastView: CellImmutable;

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
    this._dirty = false;
    this._dirtyKeys = { hasRoad: false, buildingId: false };
    this._lastView = {
      x: this.x,
      y: this.y,
      key: this.key,
      hasRoad: this.hasRoad,
      buildingId: this.buildingId,
      addRoad: this.addRoad.bind(this),
      addBuilding: this.addBuilding.bind(this),
    };
  }

  getImmutalbe(): CellImmutable {
    return this._updateImmutable();
  }

  _markDirty(key: keyof Cell["_dirtyKeys"]) {
    this._dirty = true;
    this._dirtyKeys.hasRoad = true;
    this.grid._markDirty("cellMap");
  }

  _updateImmutable() {
    if (this._dirty) {
      this._lastView = { ...this._lastView };
      if (this._dirtyKeys.hasRoad) {
        this._lastView.hasRoad = this.hasRoad;
        this._dirtyKeys.hasRoad = false;
      }
      if (this._dirtyKeys.buildingId) {
        this._lastView.buildingId = this.buildingId;
        this._dirtyKeys.buildingId = false;
      }
      this._dirty = false;
    }
    return this._lastView;
  }

  addRoad(): Cell {
    if (this.hasRoad) {
      return this;
    }
    if (this.buildingId) {
      return this;
    }
    this.hasRoad = true;
    this._markDirty("hasRoad");
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
    this._markDirty("buildingId");
    return this;
  }

  addHouse(): Cell {
    return this.addBuilding(() => new HouseBuilding());
  }
}
