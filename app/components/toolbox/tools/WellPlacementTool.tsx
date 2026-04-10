import { CellSelectionMode } from "~/components/gameView";
import { BaseTool } from "./BaseTool";
import { OnSelectionProps } from "../ToolSelector";

export class WellPlacementTool extends BaseTool {
  name: "well-placement";
  mode: CellSelectionMode;

  constructor() {
    super();
    this.name = "well-placement";
    this.mode = "endpoint";
    this.onSelection = this.onSelection.bind(this);
  }

  renderOptions() {
    return null;
  }

  onSelection({ setGame, allCoords: [coords] }: OnSelectionProps) {
    setGame((game) => game.addWell(coords));
  }
}
