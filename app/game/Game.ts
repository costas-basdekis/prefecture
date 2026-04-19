import {
  Buildings,
  BuildingsImmutable,
  FarmBuildingOptions,
} from "./buildings";
import type { Coords } from "./Coords";
import { Grid, GridMakeOptions, GridImmutable } from "./Grid";
import {
  Immutable,
  methodMutate,
  Mutable,
  mutable,
  MutationHelper,
} from "../immutable";
import { People, PeopleImmutable } from "./people";

export type GameImmutable = Pick<Game, "tickCount"> & {
  grid: GridImmutable;
  buildings: BuildingsImmutable;
  people: PeopleImmutable;
  addRoads(allCoords: Coords[]): GameImmutable;
  addHouses(allCoords: Coords[]): GameImmutable;
  addWell(coords: Coords): GameImmutable;
  addFarm(
    coords: Coords,
    options: Pick<FarmBuildingOptions, "productionOutput">,
  ): GameImmutable;
  addGranary(coords: Coords): GameImmutable;
  tick(): GameImmutable;
} & Immutable<Game>;

export class Game implements Mutable<Game, GameImmutable> {
  mutationHelper: MutationHelper<Game, GameImmutable>;
  @mutable("plainValue")
  tickCount: number;
  @mutable("mutable")
  grid: Grid;
  @mutable("mutable")
  buildings: Buildings;
  @mutable("mutable")
  people: People;

  constructor(options: GridMakeOptions = { width: 25, height: 25 }) {
    this.tickCount = 0;
    this.grid = new Grid(this, options);
    this.buildings = new Buildings(this);
    this.people = new People(this);
    this.mutationHelper = new MutationHelper<Game, GameImmutable>(this);
  }

  @methodMutate
  addRoads(allCoords: Coords[]): Game {
    this.grid.addRoads(allCoords);
    return this;
  }

  @methodMutate
  addHouses(allCoords: Coords[]): Game {
    this.grid.addHouses(allCoords);
    return this;
  }

  @methodMutate
  addWell(coords: Coords): Game {
    this.grid.addWell(coords);
    return this;
  }

  @methodMutate
  addFarm(
    coords: Coords,
    options: Pick<FarmBuildingOptions, "productionOutput">,
  ): Game {
    this.grid.addFarm(coords, options);
    return this;
  }

  @methodMutate
  addGranary(coords: Coords): Game {
    this.grid.addGranary(coords);
    return this;
  }

  @methodMutate
  tick(): Game {
    this.tickCount++;
    this.people.tick(this.tickCount);
    this.buildings.tick(this.tickCount);
    return this;
  }
}
