import { useCallback, ChangeEvent } from "react";
import { Coords, GameImmutable } from "../../game";
import {
  FarmPlacementTool,
  HousePlacementTool,
  RoadPlacementTool,
  SelectionTool,
  WellPlacementTool,
} from "./tools";
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
        case "house-placement":
          onChange(new HousePlacementTool());
          return;
        case "well-placement":
          onChange(new WellPlacementTool());
          return;
        case "farm-placement":
          onChange(new FarmPlacementTool());
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
        <label>
          <input
            type={"radio"}
            value={"house-placement"}
            checked={tool.name === "house-placement"}
            onChange={innerOnChange}
          />
          House
        </label>
        <label>
          <input
            type={"radio"}
            value={"well-placement"}
            checked={tool.name === "well-placement"}
            onChange={innerOnChange}
          />
          Well
        </label>
        <label>
          <input
            type={"radio"}
            value={"farm-placement"}
            checked={tool.name === "farm-placement"}
            onChange={innerOnChange}
          />
          Farm
        </label>
      </div>
      <tool.renderOptions onChange={onChange} />
    </>
  );
}
export interface OnSelectionProps {
  game: GameImmutable;
  setGame: React.Dispatch<React.SetStateAction<GameImmutable>>;
  startCoords: Coords;
  endCoords: Coords;
  allCoords: Coords[];
}
