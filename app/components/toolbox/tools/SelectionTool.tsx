import { useCallback } from "react";
import { CellSelectionMode, CellSelectionModeSelector } from "../../gameView";
import { BaseTool } from "./BaseTool";
import { Tool } from "../Tool";

export class SelectionTool extends BaseTool {
  name: "selection";
  mode: CellSelectionMode | undefined;

  constructor(mode: CellSelectionMode = "line-xy") {
    super();
    this.name = "selection";
    this.mode = mode;
    this.renderOptions = this.renderOptions.bind(this);
  }

  changeMode(mode: CellSelectionMode): SelectionTool {
    return new SelectionTool(mode);
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
        Selection
        <CellSelectionModeSelector
          selectionMode={this.mode}
          onSelectionModeChange={onSelectionModeChange}
        />
      </>
    );
  }

  onSelection() {}
}
