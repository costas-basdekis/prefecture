import lodash from "lodash";
import { Cell, CellImmutable } from "./Cell";
import { Coords, makeCoordsKey } from "./Coords";
import type { Game } from "./Game";
import { Building } from "./buildings";
import {
  immutable,
  Immutable,
  Mutable,
  mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";

export interface GridMakeOptions {
  width: number;
  height: number;
}

export type GridImmutable = Pick<Grid, "width" | "height"> & {
  cellMap: CellMapImmutable;
  getCells(): CellImmutable[];
} & Immutable<Grid>;

export type CellMap = Record<string, Cell>;
export type CellMapImmutable = Record<string, CellImmutable>;

export class Grid implements Mutable<Grid, GridImmutable> {
  mutationHelper: MutationHelper<Grid, GridImmutable>;
  @parentKey("grid")
  game: Game;
  @mutable("mappedMutable")
  cellMap: CellMap;
  @immutable
  width: number;
  @immutable
  height: number;

  constructor(game: Game, { width, height }: GridMakeOptions) {
    this.game = game;
    this.cellMap = Object.fromEntries(
      lodash
        .range(height)
        .flatMap((y) =>
          lodash.range(width).map((x) => new Cell(this, { x, y })),
        )
        .map((cell) => [cell.key, cell] as const),
    );
    this.width = width;
    this.height = height;
    this.mutationHelper = new MutationHelper<Grid, GridImmutable>(this, {
      getCells(this: GridImmutable) {
        return Object.values(this.cellMap);
      },
    });
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
