import lodash from "lodash";
import { Cell } from "./Cell";
import { Coords, makeCoordsKey } from "./Coords";
import { Game } from "./Game";
import { Building } from "./buildings";

export interface GridMakeOptions {
  width: number;
  height: number;
}

export type GridImmutable = Pick<
  Grid,
  "cellMap" | "width" | "height" | "cells"
> & {
  _mutable: Grid;
};

export type CellMap = Record<string, Cell>;

export class Grid {
  game: Game;
  cellMap: CellMap;
  width: number;
  height: number;
  nextBuildingId: number;
  _dirty: boolean;
  _dirtyKeys: { cellMap: boolean };
  _lastView: GridImmutable;

  static make({ width, height }: GridMakeOptions): Grid {
    return new this({
      game: null,
      cellMap: Object.fromEntries(
        lodash
          .range(height)
          .flatMap((y) => lodash.range(width).map((x) => Cell.make({ x, y })))
          .map((cell) => [cell.key, cell] as const),
      ),
      width,
      height,
      nextBuildingId: 0,
    });
  }

  constructor({
    game,
    cellMap,
    width,
    height,
    nextBuildingId,
  }: {
    game: Game | null;
    cellMap: Record<string, Cell>;
    width: number;
    height: number;
    nextBuildingId: number;
  }) {
    this.game = game!;
    this.cellMap = cellMap;
    for (const cell of this.cells) {
      cell.grid = this;
    }
    this.width = width;
    this.height = height;
    this.nextBuildingId = nextBuildingId;
    this._dirty = false;
    this._dirtyKeys = { cellMap: false };
    this._lastView = {
      _mutable: this,
      cellMap: { ...this.cellMap },
      width: this.width,
      height: this.height,
      get cells() {
        return Object.values(this.cellMap);
      },
    };
  }

  getImmutable(): GridImmutable {
    return this._updateImmutable();
  }

  _markDirty(key: keyof Grid["_dirtyKeys"]) {
    this._dirtyKeys[key] = true;
    this._dirty = true;
    this.game._markDirty("grid");
  }

  _updateImmutable(): GridImmutable {
    if (this._dirty) {
      this._lastView = {
        ...this._lastView,
      };
      if (this._dirtyKeys.cellMap) {
        this._lastView.cellMap = { ...this.cellMap };
        this._dirtyKeys.cellMap = false;
      }
      this._dirty = false;
    }
    return this._lastView;
  }

  get cells(): Cell[] {
    return Object.values(this.cellMap);
  }

  addRoads(allCoords: Coords[]): Grid {
    for (const coords of allCoords) {
      this.cellMap[makeCoordsKey(coords)].addRoad();
    }
    return this;
  }

  addBuilding(building: Building): Building {
    return this.game.addBuilding(building);
  }

  addHouses(allCoords: Coords[]): Grid {
    for (const coords of allCoords) {
      this.cellMap[makeCoordsKey(coords)].addHouse();
    }
    return this;
  }
}
