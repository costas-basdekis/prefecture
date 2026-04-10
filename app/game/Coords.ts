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

export function getDistance(left: Coords, right: Coords): number {
  const dX = left.x - right.x;
  const dY = left.y - right.y;
  return Math.sqrt(dX * dX + dY * dY);
}
