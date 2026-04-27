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
import {
  BaseBuildingOptions,
  Building,
  FarmBuilding,
  FarmBuildingOptions,
} from "./buildings";
import _ from "lodash";
import { GranaryBuilding } from "./buildings/GranaryBuilding";
import { WaterCoverage } from "./buildings/WaterCoverage";
import { MarketBuilding } from "./buildings/MarketBuilding";

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
  @mutable("mutableMap")
  cellMap: CellMap;
  @immutable
  width: number;
  @immutable
  height: number;
  waterCoverage: WaterCoverage;

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
    this.waterCoverage = new WaterCoverage(this);
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

  makeRectangleBuildingOptions(
    coords: Coords,
    width: number,
    height: number,
  ): BaseBuildingOptions {
    const positions = _.range(width).flatMap((dX) =>
      _.range(height).map((dY) => ({ x: coords.x + dX, y: coords.y + dY })),
    );
    return {
      positions,
      topLeftPosition: coords,
      bottomRightPosition: {
        x: coords.x + width - 1,
        y: coords.y + height - 1,
      },
      width,
      height,
    };
  }

  addHouses(allCoords: Coords[]): Grid {
    for (const coords of allCoords) {
      this.cellMap[makeCoordsKey(coords)].addHouse(
        this.makeRectangleBuildingOptions(coords, 1, 1),
      );
    }
    return this;
  }

  addWell(coords: Coords) {
    this.cellMap[makeCoordsKey(coords)].addWell(
      this.makeRectangleBuildingOptions(coords, 1, 1),
    );
    return this;
  }

  addFarm(
    coords: Coords,
    options: Pick<FarmBuildingOptions, "productionOutput">,
  ) {
    const buildingOptions = this.makeRectangleBuildingOptions(coords, 3, 3);
    this.addBuilding(
      buildingOptions.positions,
      () =>
        new FarmBuilding(this.game.buildings, {
          ...buildingOptions,
          ...options,
        }),
    );
  }

  addGranary(coords: Coords) {
    const buildingOptions = this.makeRectangleBuildingOptions(coords, 3, 3);
    this.addBuilding(
      buildingOptions.positions,
      () => new GranaryBuilding(this.game.buildings, buildingOptions),
    );
  }

  addMarket(coords: Coords) {
    const buildingOptions = this.makeRectangleBuildingOptions(coords, 2, 2);
    this.addBuilding(
      buildingOptions.positions,
      () => new MarketBuilding(this.game.buildings, buildingOptions),
    );
  }
}
