import { Grid, makeCellKey } from "../../game";
import { CellView } from "./CellView";

export function GridView({ grid }: { grid: Grid }) {
  return Object.values(grid).map((cell) => (
    <CellView key={makeCellKey(cell)} cell={cell} />
  ));
}
