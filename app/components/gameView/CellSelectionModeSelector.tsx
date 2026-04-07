import { useCallback, ChangeEvent } from "react";
import { CellSelectionMode, cellSelectionModeNames } from "./CellSelectionMode";

export function CellSelectionModeSelector({
  selectionMode,
  onSelectionModeChange,
}: {
  selectionMode: CellSelectionMode | undefined;
  onSelectionModeChange: (selectionMode: CellSelectionMode | undefined) => void;
}) {
  const onChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onSelectionModeChange((e.target.value as CellSelectionMode) || undefined);
    },
    [onSelectionModeChange],
  );
  return (
    <div>
      <label>
        Selection mode:
        <select onChange={onChange} value={selectionMode ?? ""}>
          <option value={""}>None</option>
          {Object.entries(cellSelectionModeNames).map(
            ([selectionMode, name]) => (
              <option key={selectionMode} value={selectionMode}>
                {name}
              </option>
            ),
          )}
        </select>
      </label>
    </div>
  );
}
