import { Coords, makeCoordsKey } from "./Coords";

export class Cell {
  x: number;
  y: number;
  key: string;
  hasRoad: boolean;

  static make(coords: Coords): Cell {
    return new this({ ...coords, hasRoad: false });
  }

  constructor({ x, y, hasRoad }: Pick<Cell, "x" | "y" | "hasRoad">) {
    this.x = x;
    this.y = y;
    this.key = makeCoordsKey(this);
    this.hasRoad = hasRoad;
  }

  addRoad(): Cell {
    if (this.hasRoad) {
      return this;
    }
    return new Cell({ ...this, hasRoad: true });
  }
}
