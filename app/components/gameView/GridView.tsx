import { Game } from "../../game";
import { CellView } from "./CellView";

export function GridView({ game }: { game: Game }) {
  return (
    <g className="grid">
      {game.grid.cells.map((cell) => (
        <CellView key={cell.key} cell={cell} />
      ))}
    </g>
  );
}
