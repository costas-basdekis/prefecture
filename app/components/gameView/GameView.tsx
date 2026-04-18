import { Coords, GameImmutable } from "~/game";
import { GridView } from "./GridView";
import { GridOverlayView } from "./GridOverlayView";
import React, { useCallback } from "react";
import { Tool } from "../toolbox";
import { PeopleView } from "./PeopleView";
import { BuildingsView } from "./BuildingsView";

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
      <BuildingsView game={game} />
      <PeopleView game={game} />
      <GridOverlayView
        game={game}
        selectionMode={tool.mode}
        size={tool.size}
        onSelection={onSelection}
      />
    </>
  );
}
