import lodash from "lodash";
import { Cell, CellImmutable } from "./Cell";
import { Coords, makeCoordsKey } from "./Coords";
import type { Game } from "./Game";
import {
  immutable,
  Immutable,
  Mutable,
  mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import { Building, FarmBuilding, FarmBuildingOptions } from "./buildings";
import _ from "lodash";

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

  addBuilding(positions: Coords[], makeBuilding: () => Building): boolean {
    if (
      positions.some((coords) => {
        const cell = this.cellMap[makeCoordsKey(coords)];
        return !cell || !cell.canAddBuilding;
      })
    ) {
      return false;
    }
    const building = makeBuilding();
    const makeBuildingForCell = () => building;
    for (const cell of building.cells) {
      cell.addBuilding(makeBuildingForCell);
    }
    return true;
  }

  addHouses(allCoords: Coords[]): Grid {
    for (const coords of allCoords) {
      this.cellMap[makeCoordsKey(coords)].addHouse({
        positions: [coords],
        topLeftPosition: coords,
        bottomRightPosition: coords,
        width: 1,
        height: 1,
      });
    }
    return this;
  }

  addWell(coords: Coords) {
    this.cellMap[makeCoordsKey(coords)].addWell({
      positions: [coords],
      topLeftPosition: coords,
      bottomRightPosition: coords,
      width: 1,
      height: 1,
    });
    return this;
  }

  addFarm(coords: Coords, options: Pick<FarmBuildingOptions, "crop">) {
    const positions = _.range(3).flatMap((dX) =>
      _.range(3).map((dY) => ({ x: coords.x + dX, y: coords.y + dY })),
    );
    this.addBuilding(
      positions,
      () =>
        new FarmBuilding(this.game.buildings, {
          positions,
          topLeftPosition: coords,
          bottomRightPosition: { x: coords.x + 2, y: coords.y + 2 },
          width: 3,
          height: 3,
          ...options,
        }),
    );
  }
}
