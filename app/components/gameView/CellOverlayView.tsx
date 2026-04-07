import "./cellOverlayView.css";
import { Cell } from "~/game";

export function CellOverlayView({ cell }: { cell: Cell }) {
  return (
    <rect
      className="grid-overlay-cell"
      x={cell.x * 20}
      y={cell.y * 20}
      width={20}
      height={20}
    />
  );
}
