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

export class Game {
  grid: Grid;
  buildings: Buildings;
  _dirty: boolean;
  _dirtyKeys: { grid: boolean; buildings: boolean };
  _lastView: GameImmutable;

  static make(options: GridMakeOptions): Game {
    return new this(Grid.make(options), Buildings.make());
  }

  constructor(grid: Grid, buildings: Buildings) {
    this.grid = grid;
    this.grid.game = this;
    this.buildings = buildings;
    this.buildings.game = this;
    this._dirty = false;
    this._dirtyKeys = { grid: false, buildings: false };
    this._lastView = {
      _mutable: this,
      grid: this.grid.getImmutable(),
      buildings: this.buildings.getImmutable(),
      addRoads(allCoords: Coords[]): GameImmutable {
        return this._mutable._mutate((game) => {
          game.addRoads(allCoords);
        });
      },
      addHouses(allCoords: Coords[]): GameImmutable {
        return this._mutable._mutate((game) => {
          game.addHouses(allCoords);
        });
      },
    };
  }

  getImmutable(): GameImmutable {
    return this._updateImmutable();
  }

  _markDirty(key: keyof Game["_dirtyKeys"]) {
    this._dirtyKeys[key] = true;
    this._dirty = true;
  }

  _updateImmutable(): GameImmutable {
    if (this._dirty) {
      this._lastView = {
        ...this._lastView,
      };
      if (this._dirtyKeys.grid) {
        this._lastView.grid = this.grid.getImmutable();
        this._dirtyKeys.grid = false;
      }
      if (this._dirtyKeys.buildings) {
        this._lastView.buildings = this.buildings.getImmutable();
        this._dirtyKeys.buildings = false;
      }
      this._dirty = false;
    }
    return this._lastView;
  }

  _mutate(func: (game: Game) => void): GameImmutable {
    func(this);
    return this._updateImmutable();
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
