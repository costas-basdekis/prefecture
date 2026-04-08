import { Coords, Game } from "~/game";
import { GridView } from "./GridView";
import { GridOverlayView } from "./GridOverlayView";
import React, { useCallback, useState } from "react";
import { Tool, SelectionTool } from "../toolbox";

export function GameView({
  game,
  setGame,
  tool,
}: {
  game: Game;
  setGame: React.Dispatch<React.SetStateAction<Game>>;
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
