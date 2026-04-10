import { FC, ReactNode, useCallback, useState } from "react";
import { Game } from "~/game";
import { Tool, SelectionTool, ToolSelector } from "./toolbox";
import { GameView } from "./gameView";

export function GameController({
  initialGame,
  SvgComponent,
}: {
  initialGame?: Game;
  SvgComponent: FC<{ children: ReactNode }>;
}) {
  const [game, setGame] = useState(() =>
    (initialGame ?? new Game()).mutationHelper.getImmutable(),
  );
  const [tool, setTool] = useState<Tool>(new SelectionTool());
  const onTickClick = useCallback(() => {
    setGame((game) => game.tick());
  }, [setGame]);
  return (
    <>
      <ToolSelector tool={tool} onChange={setTool} />
      <div>
        <button
          className="rounded-md text-white p-1 bg-green-500"
          onClick={onTickClick}
        >
          Tick
        </button>
      </div>
      <SvgComponent>
        <GameView game={game} setGame={setGame} tool={tool} />
      </SvgComponent>
    </>
  );
}
