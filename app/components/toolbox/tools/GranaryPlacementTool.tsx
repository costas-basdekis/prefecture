import { CellSelectionMode } from "~/game";
import { BaseTool } from "./BaseTool";
import { OnSelectionProps } from "../ToolSelector";
import { toolsByName } from "./toolsByName";

declare module "./Tool" {
  interface ToolDefinitions {
    granary: GranaryPlacementTool;
  }
}

export class GranaryPlacementTool extends BaseTool {
  name: "granary-placement" = "granary-placement";
  label = "Granary";
  mode: CellSelectionMode = "endpoint";
  size = { width: 3, height: 3 };

  renderOptions() {
    return null;
  }

  onSelection = ({ setGame, allCoords: [coords] }: OnSelectionProps) => {
    setGame((game) => game.addGranary(coords));
  };
}

toolsByName["granary-placement"] = new GranaryPlacementTool();
