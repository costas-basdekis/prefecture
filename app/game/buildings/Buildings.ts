import { Game } from "../Game";
import { Building } from "./Building";

type BuildingMap = Record<number, Building>;

export type BuildingsImmutable = Pick<Buildings, "nextId" | "byId" | "add">;

export class Buildings {
  game: Game;
  nextId: number;
  byId: BuildingMap;
  _dirty: boolean;
  _dirtyKeys: { nextId: boolean; byId: boolean };
  _lastView: BuildingsImmutable;

  static make(): Buildings {
    return new this(null, 1, {});
  }

  constructor(game: Game | null, nextId: number, byId: BuildingMap) {
    this.game = game!;
    this.nextId = nextId;
    this.byId = byId;
    this._dirty = false;
    this._dirtyKeys = { nextId: false, byId: false };
    this._lastView = {
      nextId: this.nextId,
      byId: this.byId,
      add: this.add.bind(this),
    };
  }

  getImmutable(): BuildingsImmutable {
    return this._updateImmutable();
  }

  _markDirty(...keys: (keyof Buildings["_dirtyKeys"])[]) {
    for (const key of keys) {
      this._dirtyKeys[key] = true;
    }
    this._dirty = true;
    this.game._markDirty("buildings");
  }

  _updateImmutable(): BuildingsImmutable {
    if (this._dirty) {
      this._lastView = { ...this._lastView };
      if (this._dirtyKeys.nextId) {
        this._lastView.nextId = this.nextId;
        this._dirtyKeys.nextId = false;
      }
      if (this._dirtyKeys.byId) {
        this._lastView.byId = { ...this.byId };
        this._dirtyKeys.byId = false;
      }
      this._dirty = false;
    }
    return this._lastView;
  }

  add(building: Building): Building {
    building.id = this.nextId;
    this.nextId++;
    this.byId[building.id] = building;
    this._markDirty("nextId", "byId");
    return building;
  }
}
