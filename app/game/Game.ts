import { Building, Buildings, BuildingsImmutable } from "./buildings";
import { Coords } from "./Coords";
import { Grid, GridMakeOptions, GridImmutable } from "./Grid";
import { methodMutate, Mutable, mutate, MutationHelper } from "../immutable";

export type GameImmutable = {
  _mutable: Game;
  grid: GridImmutable;
  buildings: BuildingsImmutable;
  addRoads(allCoords: Coords[]): GameImmutable;
  addHouses(allCoords: Coords[]): GameImmutable;
};

export class GameMutationHelper extends MutationHelper<
  Game,
  GameImmutable,
  { grid: boolean; buildings: boolean }
> {
  getInitialDirtyKeys() {
    return { grid: false, buildings: false };
  }
}

export class Game implements Mutable<Game, GameImmutable> {
  mutationHelper: GameMutationHelper;
  @mutate("mutable")
  grid: Grid;
  @mutate("mutable")
  buildings: Buildings;

  static make(options: GridMakeOptions): Game {
    return new this(Grid.make(options), Buildings.make());
  }

  constructor(grid: Grid, buildings: Buildings) {
    this.grid = grid;
    this.grid.game = this;
    this.buildings = buildings;
    this.buildings.game = this;
    this.mutationHelper = new GameMutationHelper(this);
  }

  getImmutable(): GameImmutable {
    return this.mutationHelper.getImmutable();
  }

  @methodMutate
  addRoads(allCoords: Coords[]): Game {
    this.grid.addRoads(allCoords);
    return this;
  }

  addBuilding(building: Building): Building {
    return this.buildings.add(building);
  }

  @methodMutate
  addHouses(allCoords: Coords[]): Game {
    this.grid.addHouses(allCoords);
    return this;
  }
}
