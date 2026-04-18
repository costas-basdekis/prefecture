import { CellImmutable, GameImmutable } from "~/game";
import { CellOverlayView } from "./CellOverlayView";
import { useCallback, useMemo, useState } from "react";
import { Coords, makeCoordsKey } from "~/game/Coords";
import { CellSelectionMode, selectCells } from "./CellSelectionMode";

export function GridOverlayView({
  game,
  onSelection,
  selectionMode,
  size,
}: {
  game: GameImmutable;
  onSelection?: (
    startCoords: Coords,
    endCoords: Coords,
    allCoords: Coords[],
  ) => void;
  selectionMode?: CellSelectionMode;
  size?: { width: number; height: number };
}) {
  const [startCoords, setStartCoords] = useState<Coords | null>(null);
  const [endCoords, setEndCoords] = useState<Coords | null>(null);
  const allCoords = useMemo(() => {
    if (size) {
      if (selectionMode !== "endpoint") {
        throw new Error(
          `Only 'endpoing' selection mode is allowed when size is provided, not '${selectionMode}'`,
        );
      }
      if (!endCoords) {
        return [];
      }
      return selectCells("square", endCoords, {
        x: endCoords.x + size.width - 1,
        y: endCoords.y + size.height - 1,
      });
    }
    if (!selectionMode || !startCoords || !endCoords) {
      return [];
    }
    return selectCells(selectionMode, startCoords, endCoords);
  }, [selectionMode, size, startCoords, endCoords]);
  const allCoordsByKey = useMemo(() => {
    return Object.fromEntries(
      allCoords.map((coords) => [makeCoordsKey(coords), coords]),
    );
  }, [allCoords]);
  const onCellMouseDown = useCallback(
    (cell: CellImmutable) => {
      if (selectionMode) {
        const coords = { x: cell.x, y: cell.y };
        setStartCoords(coords);
        setEndCoords(coords);
      }
    },
    [selectionMode, setStartCoords, setEndCoords],
  );
  const onCellMouseMove = useCallback(
    (cell: CellImmutable) => {
      if (selectionMode && (size || startCoords)) {
        setEndCoords({ x: cell.x, y: cell.y });
      }
    },
    [selectionMode, startCoords, setEndCoords],
  );
  const onCellMouseUp = useCallback(
    (cell: CellImmutable) => {
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
      {game.grid.getCells().map((cell) => (
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
