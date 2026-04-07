import { useCallback, useState } from "react";
import { Grid } from "./game";
import {
  GridOverlayView,
  GridView,
  SelectionTool,
  Tool,
  ToolSelector,
} from "./components";
import { Coords } from "./game/Coords";

export function Main() {
  const [grid, setGrid] = useState(() => Grid.make({ width: 25, height: 25 }));
  const [tool, setTool] = useState<Tool>(new SelectionTool());
  const onSelection = useCallback(
    (startCoords: Coords, endCoords: Coords, allCoords: Coords[]) => {
      if (!("onSelection" in tool)) {
        return undefined;
      }
      return tool.onSelection({
        grid,
        setGrid,
        startCoords,
        endCoords,
        allCoords,
      });
    },
    [tool, grid, setGrid],
  );
  return (
    <main className="flex flex-col items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">Prefecture</header>
      </div>
      <ToolSelector tool={tool} onChange={setTool} />
      <svg
        className="flex-1 flex flex-col items-center"
        width={1000}
        height={600}
      >
        <GridView grid={grid} />
        <GridOverlayView
          grid={grid}
          selectionMode={"mode" in tool ? tool.mode : undefined}
          onSelection={onSelection}
        />
      </svg>
    </main>
  );
}
