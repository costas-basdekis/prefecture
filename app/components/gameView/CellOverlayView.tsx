import { useCallback } from "react";
import "./cellOverlayView.css";
import { CellImmutable } from "~/game";

export function CellOverlayView({
  cell,
  selected,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: {
  cell: CellImmutable;
  selected?: boolean;
  onMouseDown?: (cell: CellImmutable) => void;
  onMouseMove?: (cell: CellImmutable) => void;
  onMouseUp?: (cell: CellImmutable) => void;
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
