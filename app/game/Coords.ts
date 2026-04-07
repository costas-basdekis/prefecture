export interface Coords {
  x: number;
  y: number;
}

export function makeCoordsKey({ x, y }: Coords): string {
  return `${x},${y}`;
}

export function areCoordsEqual(left: Coords, right: Coords): boolean {
  return left.x === right.x && left.y === right.y;
}
