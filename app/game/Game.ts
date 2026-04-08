import { Building, Buildings } from "./buildings";
import { Coords } from "./Coords";
import { Grid, GridMakeOptions } from "./Grid";

export class Game {
  grid: Grid;
  buildings: Buildings;

  static make(options: GridMakeOptions): Game {
    return new this(Grid.make(options), Buildings.make());
  }

  constructor(grid: Grid, buildings: Buildings) {
    this.grid = grid;
    this.buildings = buildings;
  }

  addRoads(allCoords: Coords[]): Game {
    return new Game(this.grid.addRoads(allCoords), this.buildings);
  }

  addHouses(allCoords: Coords[]): Game {
    let buildings = this.buildings;
    function addBuilding(building: Building): Building {
      buildings = buildings.add(building);
      return building;
    }
    return new Game(this.grid.addHouses(allCoords, addBuilding), buildings);
  }
}
