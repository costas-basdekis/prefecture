import "./cellView.css";
import { Cell } from "../../game";

export function CellView({ cell }: { cell: Cell }) {
  return (
    <rect
      className={`grid-cell ${cell.hasRoad ? "with-road" : ""} ${cell.building ? `with-building-${cell.building.type}` : ""}`}
      x={cell.x * 20}
      y={cell.y * 20}
      width={20}
      height={20}
    />
  );
}
