import "./cellView.css";
import { Cell, Game } from "../../game";
import { useMemo } from "react";

export function CellView({ game, cell }: { game: Game; cell: Cell }) {
  const building = useMemo(() => {
    if (!cell.buildingId) {
      return null;
    }
    return game.buildings.byId[cell.buildingId];
  }, [game.buildings, cell]);
  return (
    <rect
      className={`grid-cell ${cell.hasRoad ? "with-road" : ""} ${building ? `with-building-${building.type}` : ""}`}
      x={cell.x * 20}
      y={cell.y * 20}
      width={20}
      height={20}
    />
  );
}
