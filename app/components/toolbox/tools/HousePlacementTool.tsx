import { CellSelectionMode } from "~/components/gameView";
import { BaseTool } from "./BaseTool";
import { OnSelectionProps } from "../ToolSelector";
import { toolsByName } from "./toolsByName";

declare module "./Tool" {
  interface ToolDefinitions {
    house: HousePlacementTool;
  }
}

export class HousePlacementTool extends BaseTool {
  name: "house-placement" = "house-placement";
  label = "House";
  mode: CellSelectionMode = "square";

  renderOptions() {
    return null;
  }

  onSelection = ({ setGame, allCoords }: OnSelectionProps) => {
    setGame((game) => game.addHouses(allCoords));
  };
}

toolsByName["house-placement"] = new HousePlacementTool();
