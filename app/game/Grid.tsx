import lodash from "lodash";
import { Cell, CellImmutable } from "./Cell";
import { Coords, makeCoordsKey } from "./Coords";
import { Game } from "./Game";
import { Building } from "./buildings";
import {
  immutable,
  Immutable,
  Mutable,
  mutate,
  MutationHelper,
} from "~/immutable";

export interface GridMakeOptions {
  width: number;
  height: number;
}

export type GridImmutable = Pick<Grid, "width" | "height"> & {
  cellMap: CellMapImmutable;
  getCells(): CellImmutable[];
} & Immutable<Grid>;

export class GridMutationHelper extends MutationHelper<
  Grid,
  GridImmutable,
  { cellMap: Set<string> },
  ["cellMap", string]
> {
  getExtraInitialImmutable() {
    return {
      getCells(this: GridImmutable) {
        return Object.values(this.cellMap);
      },
    };
  }

  markDirty(...keys: ["cellMap", string][]): void {
    super.markDirty(...keys);
    this.mutable.game.mutationHelper.markDirty("grid");
  }
}

export type CellMap = Record<string, Cell>;
export type CellMapImmutable = Record<string, CellImmutable>;

export class Grid implements Mutable<Grid, GridImmutable> {
  mutationHelper: GridMutationHelper;
  game: Game;
  @mutate("mappedMutable")
  cellMap: CellMap;
  @immutable
  width: number;
  @immutable
  height: number;

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
    });
  }

  constructor({
    game,
    cellMap,
    width,
    height,
  }: {
    game: Game | null;
    cellMap: Record<string, Cell>;
    width: number;
    height: number;
  }) {
    this.game = game!;
    this.cellMap = cellMap;
    for (const cell of this.cells) {
      cell.grid = this;
    }
    this.width = width;
    this.height = height;
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
