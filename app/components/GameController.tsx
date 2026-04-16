import { FC, ReactNode, useCallback, useMemo, useState } from "react";
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
  const [mutableGame, initialImmutableGame] = useMemo(() => {
    const mutableGame = initialGame ?? new Game();
    return [mutableGame, mutableGame.mutationHelper.getImmutable()];
  }, []);
  const [game, innerSetGame] = useState(initialImmutableGame);
  // We need to prevent double actions in React dev
  const setGame = useMemo(
    () => mutableGame.mutationHelper.getIfAtLatestMutator(innerSetGame),
    [innerSetGame],
  );
  const [tool, setTool] = useState<Tool>(new SelectionTool());
  const onTickClick = useCallback(() => {
    setGame((game) => {
      return game.tick();
    });
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
