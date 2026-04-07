import { useCallback } from "react";
import {
  CellSelectionMode,
  CellSelectionModeSelector,
  lineCellSelectionModes,
} from "../../gameView";
import { OnSelectionProps } from "../ToolSelector";
import { BaseTool } from "./BaseTool";
import { Tool } from "../Tool";

export class RoadPlacementTool extends BaseTool {
  name: "road-placement";
  mode: CellSelectionMode;

  constructor(mode: CellSelectionMode = "line-xy") {
    super();
    this.name = "road-placement";
    this.mode = mode;
    this.renderOptions = this.renderOptions.bind(this);
    this.onSelection = this.onSelection.bind(this);
  }

  changeMode(mode: CellSelectionMode): RoadPlacementTool {
    return new RoadPlacementTool(mode);
  }

  renderOptions({ onChange }: { onChange: (tool: Tool) => void }) {
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
  }

  onSelection({ setGrid, allCoords }: OnSelectionProps) {
    setGrid((grid) => grid.addRoads(allCoords));
  }
}
