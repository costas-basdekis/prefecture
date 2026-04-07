export class Cell {
  x: number;
  y: number;
  key: string;

  static make(x: number, y: number): Cell {
    return new this(x, y);
  }

  static makeKey({ x, y }: Pick<Cell, "x" | "y">): string {
    return `${x},${y}`;
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.key = Cell.makeKey(this);
  }
}
