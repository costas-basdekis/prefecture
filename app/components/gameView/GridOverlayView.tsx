import { Cell, Grid } from "~/game";
import { CellOverlayView } from "./CellOverlayView";
import { useCallback, useMemo, useState } from "react";
import { Coords } from "~/game/Coords";
import { CellSelectionMode, selectCells } from "./CellSelectionMode";

export function GridOverlayView({
  grid,
  onSelection,
  selectionMode,
}: {
  grid: Grid;
  onSelection?: (
    startCoords: Coords,
    endCoords: Coords,
    allCoords: Coords[],
  ) => void;
  selectionMode?: CellSelectionMode;
}) {
  const [startCoords, setStartCoords] = useState<Coords | null>(null);
  const [endCoords, setEndCoords] = useState<Coords | null>(null);
  const allCoords = useMemo(() => {
    if (!selectionMode || !startCoords || !endCoords) {
      return [];
    }
    return selectCells(selectionMode, startCoords, endCoords);
  }, [startCoords, endCoords]);
  const allCoordsByKey = useMemo(() => {
    return Object.fromEntries(
      allCoords.map((coords) => [Cell.makeKey(coords), coords]),
    );
  }, [allCoords]);
  const onCellMouseDown = useCallback(
    (cell: Cell) => {
      if (selectionMode) {
        const coords = { x: cell.x, y: cell.y };
        setStartCoords(coords);
        setEndCoords(coords);
      }
    },
    [selectionMode, setStartCoords, setEndCoords],
  );
  const onCellMouseMove = useCallback(
    (cell: Cell) => {
      if (selectionMode && startCoords) {
        setEndCoords({ x: cell.x, y: cell.y });
      }
    },
    [selectionMode, startCoords, setEndCoords],
  );
  const onCellMouseUp = useCallback(
    (cell: Cell) => {
      if (startCoords && endCoords) {
        if (selectionMode) {
          onSelection?.(startCoords, endCoords, allCoords);
        }
        setStartCoords(null);
        setEndCoords(null);
      }
    },
    [startCoords, endCoords, onSelection, setStartCoords],
  );
  return (
    <g className="gridOverlay">
      {grid.cells.map((cell) => (
        <CellOverlayView
          key={cell.key}
          cell={cell}
          selected={cell.key in allCoordsByKey}
          onMouseDown={onCellMouseDown}
          onMouseMove={onCellMouseMove}
          onMouseUp={onCellMouseUp}
        />
      ))}
    </g>
  );
}
