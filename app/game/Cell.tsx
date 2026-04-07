import { Coords } from "./Coords";

export class Cell {
  x: number;
  y: number;
  key: string;

  static make(coords: Coords): Cell {
    return new this(coords);
  }

  static makeKey({ x, y }: Coords): string {
    return `${x},${y}`;
  }

  constructor({ x, y }: Coords) {
    this.x = x;
    this.y = y;
    this.key = Cell.makeKey(this);
  }
}
