import { CellSelectionMode } from "~/components/gameView";
import { BaseTool } from "./BaseTool";
import { OnSelectionProps } from "../ToolSelector";

export class HousePlacementTool extends BaseTool {
  name: "house-placement";
  mode: CellSelectionMode;

  constructor() {
    super();
    this.name = "house-placement";
    this.mode = "square";
    this.onSelection = this.onSelection.bind(this);
  }

  renderOptions() {
    return null;
  }

  onSelection({ setGame, allCoords }: OnSelectionProps) {
    setGame((game) => game.addHouses(allCoords));
  }
}
