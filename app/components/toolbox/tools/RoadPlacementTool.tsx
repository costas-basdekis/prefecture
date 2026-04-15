import { useCallback } from "react";
import {
  CellSelectionMode,
  CellSelectionModeSelector,
  lineCellSelectionModes,
} from "../../gameView";
import { OnSelectionProps } from "../ToolSelector";
import { BaseTool } from "./BaseTool";
import { Tool } from "./Tool";
import { toolsByName } from "./toolsByName";

declare module "./Tool" {
  interface ToolDefinitions {
    road: RoadPlacementTool;
  }
}

export class RoadPlacementTool extends BaseTool {
  name: "road-placement" = "road-placement";
  label = "Road";
  mode: CellSelectionMode;

  constructor(mode: CellSelectionMode = "line-xy") {
    super();
    this.mode = mode;
  }

  changeMode(mode: CellSelectionMode): RoadPlacementTool {
    return new RoadPlacementTool(mode);
  }

  renderOptions = ({ onChange }: { onChange: (tool: Tool) => void }) => {
    const onSelectionModeChange = useCallback(
      (selectionMode: CellSelectionMode) => {
        onChange(this.changeMode(selectionMode));
      },
      [onChange],
    );
    return (
      <>
        Road placement
        <CellSelectionModeSelector
          selectionMode={this.mode}
          choices={lineCellSelectionModes}
          onSelectionModeChange={onSelectionModeChange}
        />
      </>
    );
  };

  onSelection = ({ setGame, allCoords }: OnSelectionProps) => {
    setGame((game) => game.addRoads(allCoords));
  };
}

toolsByName["road-placement"] = new RoadPlacementTool();
