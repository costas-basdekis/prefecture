import lodash from "lodash";
import { makeCellKey } from "./Cell";
import { Cell } from "./Cell";

export type Grid = Record<string, Cell>;
export function makeGrid({
  width,
  height,
}: {
  width: number;
  height: number;
}): Grid {
  return Object.fromEntries(
    lodash
      .range(height)
      .flatMap((y) => lodash.range(width).map((x) => ({ x, y })))
      .map((cell) => [makeCellKey(cell), cell] as const),
  );
}
