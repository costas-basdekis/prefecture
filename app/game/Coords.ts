export interface Coords {
  x: number;
  y: number;
}

export function areCoordsEqual(left: Coords, right: Coords): boolean {
  return left.x === right.x && left.y === right.y;
}
