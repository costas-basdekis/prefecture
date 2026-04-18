import { CellSelectionMode } from "~/components/gameView";
import { BaseTool } from "./BaseTool";
import { OnSelectionProps } from "../ToolSelector";
import { toolsByName } from "./toolsByName";

declare module "./Tool" {
  interface ToolDefinitions {
    farm: FarmPlacementTool;
  }
}

export class FarmPlacementTool extends BaseTool {
  name: "farm-placement" = "farm-placement";
  label = "Farm";
  mode: CellSelectionMode = "endpoint";
  size = { width: 3, height: 3 };

  renderOptions() {
    return null;
  }

  onSelection = ({ setGame, allCoords: [coords] }: OnSelectionProps) => {
    setGame((game) => game.addFarm(coords, { crop: "wheat" }));
  };
}

toolsByName["farm-placement"] = new FarmPlacementTool();
