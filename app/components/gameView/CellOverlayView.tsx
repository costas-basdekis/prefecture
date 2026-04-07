import { useCallback } from "react";
import "./cellOverlayView.css";
import { Cell } from "~/game";

export function CellOverlayView({
  cell,
  selected,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: {
  cell: Cell;
  selected?: boolean;
  onMouseDown?: (cell: Cell) => void;
  onMouseMove?: (cell: Cell) => void;
  onMouseUp?: (cell: Cell) => void;
}) {
  const innerOnMouseDown = useCallback(() => {
    onMouseDown?.(cell);
  }, [onMouseDown]);
  const innerOnMouseMove = useCallback(() => {
    onMouseMove?.(cell);
  }, [onMouseMove]);
  const innerOnMouseUp = useCallback(() => {
    onMouseUp?.(cell);
  }, [onMouseUp]);
  return (
    <rect
      className={`grid-overlay-cell ${selected ? "selected" : ""}`}
      x={cell.x * 20}
      y={cell.y * 20}
      width={20}
      height={20}
      onMouseDown={innerOnMouseDown}
      onMouseMove={innerOnMouseMove}
      onMouseUp={innerOnMouseUp}
    />
  );
}
