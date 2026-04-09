import { Building, Buildings, BuildingsImmutable } from "./buildings";
import { Coords } from "./Coords";
import { Grid, GridMakeOptions, GridImmutable } from "./Grid";

export type GameImmutable = {
  _mutable: Game;
  grid: GridImmutable;
  buildings: BuildingsImmutable;
  addRoads(allCoords: Coords[]): GameImmutable;
  addHouses(allCoords: Coords[]): GameImmutable;
};

export class GameMutationHelper {
  mutable: Game;
  dirty: boolean;
  dirtyKeys: { grid: boolean; buildings: boolean };
  lastImmutable: GameImmutable;

  constructor(mutable: Game) {
    this.mutable = mutable;
    this.dirty = false;
    this.dirtyKeys = { grid: false, buildings: false };
    this.lastImmutable = {
      _mutable: mutable,
      grid: mutable.grid.getImmutable(),
      buildings: mutable.buildings.getImmutable(),
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

  markDirty(key: keyof GameMutationHelper["dirtyKeys"]) {
    this.dirtyKeys[key] = true;
    this.dirty = true;
  }

  getImmutable(): GameImmutable {
    return this.updateImmutable();
  }

  updateImmutable(): GameImmutable {
    if (this.dirty) {
      this.lastImmutable = {
        ...this.lastImmutable,
      };
      if (this.dirtyKeys.grid) {
        this.lastImmutable.grid = this.mutable.grid.getImmutable();
        this.dirtyKeys.grid = false;
      }
      if (this.dirtyKeys.buildings) {
        this.lastImmutable.buildings = this.mutable.buildings.getImmutable();
        this.dirtyKeys.buildings = false;
      }
      this.dirty = false;
    }
    return this.lastImmutable;
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
