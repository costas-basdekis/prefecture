import { Coords } from "./Coords";
import { Grid, GridMakeOptions } from "./Grid";

export class Game {
  grid: Grid;

  static make(options: GridMakeOptions): Game {
    return new this(Grid.make(options));
  }

  constructor(grid: Grid) {
    this.grid = grid;
  }

  addRoads(allCoords: Coords[]): Game {
    return new Game(this.grid.addRoads(allCoords));
  }

  addHouses(allCoords: Coords[]): Game {
    return new Game(this.grid.addHouses(allCoords));
  }
}
