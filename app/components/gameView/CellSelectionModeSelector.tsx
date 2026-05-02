import { useCallback, ChangeEvent } from "react";
import {
  CellSelectionMode,
  cellSelectionModeNames,
  cellSelectionModes,
} from "../../game";

const cellSelectionModesWithNone = [undefined, ...cellSelectionModes];

export function CellSelectionModeSelector({
  selectionMode,
  choices,
  onSelectionModeChange,
}: {
  selectionMode: CellSelectionMode | undefined;
  choices?: (CellSelectionMode | undefined)[];
  onSelectionModeChange: (selectionMode: CellSelectionMode) => void;
}) {
  const onChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onSelectionModeChange(e.target.value as CellSelectionMode);
    },
    [onSelectionModeChange],
  );
  return (
    <div>
      <label>
        Selection mode:
        <select onChange={onChange} value={selectionMode}>
          {(choices ?? cellSelectionModesWithNone).map((selectionMode) => (
            <option key={selectionMode ?? ""} value={selectionMode}>
              {selectionMode ? cellSelectionModeNames[selectionMode] : "None"}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
