import { Coords, makeCoordsKey } from "./Coords";

export interface HouseBuilding {
  id: number;
  type: "house";
}

export type Building = HouseBuilding;

export class Cell {
  x: number;
  y: number;
  key: string;
  hasRoad: boolean;
  building: Building | null;

  static make(coords: Coords): Cell {
    return new this({ ...coords, hasRoad: false, building: null });
  }

  constructor({
    x,
    y,
    hasRoad,
    building,
  }: Pick<Cell, "x" | "y" | "hasRoad" | "building">) {
    this.x = x;
    this.y = y;
    this.key = makeCoordsKey(this);
    this.hasRoad = hasRoad;
    this.building = building;
  }

  addRoad(): Cell {
    if (this.hasRoad) {
      return this;
    }
    if (this.building) {
      return this;
    }
    return new Cell({ ...this, hasRoad: true });
  }

  addHouse(getNextBuildingId: () => number): any {
    if (this.hasRoad) {
      return this;
    }
    if (this.building) {
      return this;
    }
    return new Cell({
      ...this,
      building: { type: "house", id: getNextBuildingId() },
    });
  }
}
