import { Building, HouseBuilding } from "./buildings";
import { Coords, makeCoordsKey } from "./Coords";

export type AddBuilding = (building: Building) => Building;

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

  addBuilding(makeBuilding: () => Building, addBuilding: AddBuilding): Cell {
    if (this.hasRoad) {
      return this;
    }
    if (this.buildingId) {
      return this;
    }
    return new Cell({
      ...this,
      buildingId: addBuilding(makeBuilding()).id,
    });
  }

  addHouse(addBuilding: AddBuilding): Cell {
    return this.addBuilding(() => new HouseBuilding(), addBuilding);
  }
}
