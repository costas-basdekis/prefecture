import { CellSelectionMode } from "~/components/gameView";
import { BaseTool } from "./BaseTool";
import { OnSelectionProps } from "../ToolSelector";
import { toolsByName } from "./toolsByName";

declare module "./Tool" {
  interface ToolDefinitions {
    market: MarketPlacementTool;
  }
}

export class MarketPlacementTool extends BaseTool {
  name: "market-placement" = "market-placement";
  label = "Market";
  mode: CellSelectionMode = "endpoint";
  size = { width: 2, height: 2 };

  renderOptions() {
    return null;
  }

  onSelection = ({ setGame, allCoords: [coords] }: OnSelectionProps) => {
    setGame((game) => game.addMarket(coords));
  };
}

toolsByName["market-placement"] = new MarketPlacementTool();
