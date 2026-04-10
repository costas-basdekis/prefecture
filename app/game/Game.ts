import { Buildings, BuildingsImmutable } from "./buildings";
import { Coords } from "./Coords";
import { Grid, GridMakeOptions, GridImmutable } from "./Grid";
import { methodMutate, Mutable, mutable, MutationHelper } from "../immutable";
import { People } from "./people";

export type GameImmutable = {
  _mutable: Game;
  grid: GridImmutable;
  buildings: BuildingsImmutable;
  addRoads(allCoords: Coords[]): GameImmutable;
  addHouses(allCoords: Coords[]): GameImmutable;
};

export class Game implements Mutable<Game, GameImmutable> {
  mutationHelper: MutationHelper<Game, GameImmutable>;
  @mutable("mutable")
  grid: Grid;
  @mutable("mutable")
  buildings: Buildings;
  @mutable("mutable")
  people: People;

  constructor(options: GridMakeOptions = { width: 25, height: 25 }) {
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
}
