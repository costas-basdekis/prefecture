import { Building, HouseBuilding } from "./buildings";
import { Coords, makeCoordsKey } from "./Coords";

export class Cell {
  x: number;
  y: number;
  key: string;
  hasRoad: boolean;
  buildingId: number | null;

  static make(coords: Coords): Cell {
    return new this({ ...coords, hasRoad: false, buildingId: null });
  }

  constructor({
    x,
    y,
    hasRoad,
    buildingId,
  }: Pick<Cell, "x" | "y" | "hasRoad" | "buildingId">) {
    this.x = x;
    this.y = y;
    this.key = makeCoordsKey(this);
    this.hasRoad = hasRoad;
    this.buildingId = buildingId;
  }

  addRoad(): Cell {
    if (this.hasRoad) {
      return this;
    }
    if (this.buildingId) {
      return this;
    }
    return new Cell({ ...this, hasRoad: true });
  }

  addHouse(addBuilding: (building: Building) => void): any {
    if (this.hasRoad) {
      return this;
    }
    if (this.buildingId) {
      return this;
    }
    const building = { type: "house", id: 0 } as HouseBuilding;
    addBuilding(building);
    return new Cell({
      ...this,
      buildingId: building.id,
    });
  }
}
