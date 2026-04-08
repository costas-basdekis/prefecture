import { Coords, GameImmutable } from "~/game";
import { GridView } from "./GridView";
import { GridOverlayView } from "./GridOverlayView";
import React, { useCallback } from "react";
import { Tool } from "../toolbox";

export function GameView({
  game,
  setGame,
  tool,
}: {
  game: GameImmutable;
  setGame: React.Dispatch<React.SetStateAction<GameImmutable>>;
  tool: Tool;
}) {
  const onSelection = useCallback(
    (startCoords: Coords, endCoords: Coords, allCoords: Coords[]) => {
      if (!("onSelection" in tool)) {
        return undefined;
      }
      return tool.onSelection({
        game,
        setGame,
        startCoords,
        endCoords,
        allCoords,
      });
    },
    [tool, game, setGame],
  );
  return (
    <>
      <GridView game={game} />
      <GridOverlayView
        game={game}
        selectionMode={"mode" in tool ? tool.mode : undefined}
        onSelection={onSelection}
      />
    </>
  );
}
