import lodash from "lodash";
import { Cell, CellImmutable } from "./Cell";
import { Coords, makeCoordsKey } from "./Coords";
import { Game } from "./Game";
import { Building } from "./buildings";

export interface GridMakeOptions {
  width: number;
  height: number;
}

export type GridImmutable = Pick<Grid, "width" | "height"> & {
  _mutable: Grid;
  cellMap: CellMapImmutable;
  getCells(): CellImmutable[];
};

export class GridMutationHelper {
  mutable: Grid;
  dirty: boolean;
  dirtyKeys: Set<string>;
  lastImmutable: GridImmutable;

  constructor(mutable: Grid) {
    this.mutable = mutable;
    this.dirty = false;
    this.dirtyKeys = new Set();
    this.lastImmutable = {
      _mutable: mutable,
      cellMap: Object.fromEntries(
        mutable.cells.map((cell) => [cell.key, cell.getImmutalbe()]),
      ),
      width: mutable.width,
      height: mutable.height,
      getCells() {
        return Object.values(this.cellMap);
      },
    };
  }

  markDirty(key: string) {
    this.dirtyKeys.add(key);
    this.dirty = true;
    this.mutable.game.mutationHelper.markDirty("grid");
  }

  getImmutable(): GridImmutable {
    return this.updateImmutable();
  }

  updateImmutable(): GridImmutable {
    if (this.dirty) {
      this.lastImmutable = {
        ...this.lastImmutable,
        cellMap: { ...this.lastImmutable.cellMap },
      };
      if (this.dirtyKeys.size) {
        for (const key of this.dirtyKeys) {
          this.lastImmutable.cellMap[key] =
            this.mutable.cellMap[key].getImmutalbe();
        }
        this.dirtyKeys.clear();
      }
      this.dirty = false;
    }
    return this.lastImmutable;
  }
}

export type CellMap = Record<string, Cell>;
export type CellMapImmutable = Record<string, CellImmutable>;

export class Grid {
  mutationHelper: GridMutationHelper;
  game: Game;
  cellMap: CellMap;
  width: number;
  height: number;
  nextBuildingId: number;

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
    this.mutationHelper = new GridMutationHelper(this);
  }

  getImmutable(): GridImmutable {
    return this.mutationHelper.getImmutable();
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
