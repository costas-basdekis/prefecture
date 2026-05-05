import { BaseTool } from "./BaseTool";
import { OnSelectionProps } from "../ToolSelector";
import { toolsByName } from "./toolsByName";
import { CellSelectionMode } from "~/game";

declare module "./Tool" {
  interface ToolDefinitions {
    temple: TemplePlacementTool;
  }
}

export class TemplePlacementTool extends BaseTool {
  name: "temple-placement" = "temple-placement";
  label = "Temple";
  mode: CellSelectionMode = "endpoint";
  size = { width: 2, height: 2 };

  renderOptions() {
    return null;
  }

  onSelection = ({ setGame, allCoords: [coords] }: OnSelectionProps) => {
    setGame((game) => game.addTemple(coords));
  };
}

toolsByName["temple-placement"] = new TemplePlacementTool();
