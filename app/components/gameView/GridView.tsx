import { Grid } from "../../game";
import { CellView } from "./CellView";

export function GridView({ grid }: { grid: Grid }) {
  return (
    <g className="grid">
      {grid.cells.map((cell) => (
        <CellView key={cell.key} cell={cell} />
      ))}
    </g>
  );
}
