import { GameImmutable } from "~/game";
import { BuildingView } from "./buildingView";

export function BuildingsView({ game }: { game: GameImmutable }) {
  return (
    <g className="buildings">
      {game.buildings.getBuildings().map((building) => (
        <BuildingView key={building.id} building={building} game={game} />
      ))}
    </g>
  );
}
