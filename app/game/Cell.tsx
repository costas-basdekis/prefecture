export interface Cell {
  x: number;
  y: number;
}

export function makeCellKey({ x, y }: Cell): string {
  return `${x},${y}`;
}
