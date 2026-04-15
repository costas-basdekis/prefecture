import { CellSelectionMode } from "~/components/gameView";
import { BaseTool } from "./BaseTool";
import { OnSelectionProps } from "../ToolSelector";

export class GranaryPlacementTool extends BaseTool {
  name: "granary-placement";
  mode: CellSelectionMode;

  constructor() {
    super();
    this.name = "granary-placement";
    this.mode = "endpoint";
    this.onSelection = this.onSelection.bind(this);
  }

  renderOptions() {
    return null;
  }

  onSelection({ setGame, allCoords: [coords] }: OnSelectionProps) {
    setGame((game) => game.addGranary(coords));
  }
}
