import { Building, Buildings, BuildingsImmutable } from "./buildings";
import { Coords } from "./Coords";
import { Grid, GridMakeOptions, GridImmutable } from "./Grid";
import { MutationHelper } from "../immutable/MutationHelper";

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

  getInitialLastImmutable() {
    return {
      _mutable: this.mutable,
      grid: this.mutable.grid.getImmutable(),
      buildings: this.mutable.buildings.getImmutable(),
      addRoads(allCoords: Coords[]): GameImmutable {
        this._mutable.addRoads(allCoords);
        return this._mutable.mutationHelper.getImmutable();
      },
      addHouses(allCoords: Coords[]): GameImmutable {
        this._mutable.addHouses(allCoords);
        return this._mutable.mutationHelper.getImmutable();
      },
    };
  }

  updateImmutableDirtyKeys() {
    if (this.dirtyKeys.grid) {
      this.lastImmutable.grid = this.mutable.grid.getImmutable();
      this.dirtyKeys.grid = false;
    }
    if (this.dirtyKeys.buildings) {
      this.lastImmutable.buildings = this.mutable.buildings.getImmutable();
      this.dirtyKeys.buildings = false;
    }
  }
}

export class Game {
  mutationHelper: GameMutationHelper;
  grid: Grid;
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

  addRoads(allCoords: Coords[]): Game {
    this.grid.addRoads(allCoords);
    return this;
  }

  addBuilding(building: Building): Building {
    return this.buildings.add(building);
  }

  addHouses(allCoords: Coords[]): Game {
    this.grid.addHouses(allCoords);
    return this;
  }
}
