import { Grid } from "~/game";
import { CellOverlayView } from "./CellOverlayView";

export function GridOverlayView({ grid }: { grid: Grid }) {
  return (
    <g className="gridOverlay">
      {grid.cells.map((cell) => (
        <CellOverlayView key={cell.key} cell={cell} />
      ))}
    </g>
  );
}
