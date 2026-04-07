import { useCallback, ChangeEvent } from "react";
import { Coords, Grid } from "../../game";
import { RoadPlacementTool, SelectionTool } from "./tools";
import { Tool, ToolName } from "./Tool";

export function ToolSelector({
  tool,
  onChange,
}: {
  tool: Tool;
  onChange: (tool: Tool) => void;
}) {
  const innerOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const toolName = e.target.value as ToolName;
      switch (toolName) {
        case "selection":
          onChange(new SelectionTool());
          return;
        case "road-placement":
          onChange(new RoadPlacementTool());
          return;
      }
      throw new Error(`Unknown tool name "${toolName}"`);
    },
    [onChange],
  );
  return (
    <>
      <div>
        <label>
          <input
            type={"radio"}
            value={"selection"}
            checked={tool.name === "selection"}
            onChange={innerOnChange}
          />
          Select
        </label>
        <label>
          <input
            type={"radio"}
            value={"road-placement"}
            checked={tool.name === "road-placement"}
            onChange={innerOnChange}
          />
          Road
        </label>
      </div>
      <tool.renderOptions onChange={onChange} />
    </>
  );
}
export interface OnSelectionProps {
  grid: Grid;
  setGrid: React.Dispatch<React.SetStateAction<Grid>>;
  startCoords: Coords;
  endCoords: Coords;
  allCoords: Coords[];
}
