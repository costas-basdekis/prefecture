import { GameImmutable } from "../../game";
import { CellView } from "./CellView";

export function GridView({ game }: { game: GameImmutable }) {
  return (
    <g className="grid">
      {game.grid.cells.map((cell) => (
        <CellView key={cell.key} game={game} cell={cell} />
      ))}
    </g>
  );
}
