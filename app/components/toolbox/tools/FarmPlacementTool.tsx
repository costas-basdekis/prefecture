import { CellSelectionMode } from "~/components/gameView";
import { BaseTool } from "./BaseTool";
import { OnSelectionProps } from "../ToolSelector";

export class FarmPlacementTool extends BaseTool {
  name: "farm-placement";
  mode: CellSelectionMode;

  constructor() {
    super();
    this.name = "farm-placement";
    this.mode = "endpoint";
    this.onSelection = this.onSelection.bind(this);
  }

  renderOptions() {
    return null;
  }

  onSelection({ setGame, allCoords: [coords] }: OnSelectionProps) {
    setGame((game) => game.addFarm(coords, { crop: "wheat" }));
  }
}
