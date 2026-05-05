import { CellSelectionMode } from "~/game";
import { BaseTool } from "./BaseTool";
import { OnSelectionProps } from "../ToolSelector";
import { toolsByName } from "./toolsByName";

declare module "./Tool" {
  interface ToolDefinitions {
    well: WellPlacementTool;
  }
}

export class WellPlacementTool extends BaseTool {
  name: "well-placement" = "well-placement";
  label = "Well";
  mode: CellSelectionMode = "endpoint";

  renderOptions() {
    return null;
  }

  onSelection = ({ setGame, allCoords: [coords] }: OnSelectionProps) => {
    setGame((game) => game.addWell(coords));
  };
}

toolsByName["well-placement"] = new WellPlacementTool();
