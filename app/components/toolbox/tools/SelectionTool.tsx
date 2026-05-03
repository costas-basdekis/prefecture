import { useCallback } from "react";
import { CellSelectionModeSelector } from "../../gameView";
import { BaseTool } from "./BaseTool";
import { Tool } from "./Tool";
import { toolsByName } from "./toolsByName";
import { CellSelectionMode } from "~/game";

declare module "./Tool" {
  interface ToolDefinitions {
    selection: SelectionTool;
  }
}

export class SelectionTool extends BaseTool {
  name: "selection" = "selection";
  label = "Selection";
  mode: CellSelectionMode | undefined;

  constructor(mode: CellSelectionMode = "line-xy") {
    super();
    this.mode = mode;
  }

  changeMode(mode: CellSelectionMode): SelectionTool {
    return new SelectionTool(mode);
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
        Selection
        <CellSelectionModeSelector
          selectionMode={this.mode}
          onSelectionModeChange={onSelectionModeChange}
        />
      </>
    );
  };

  onSelection() {}
}

toolsByName.selection = new SelectionTool();
