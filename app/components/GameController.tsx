import { FC, ReactNode, useState } from "react";
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
  return (
    <>
      <ToolSelector tool={tool} onChange={setTool} />
      <SvgComponent>
        <GameView game={game} setGame={setGame} tool={tool} />
      </SvgComponent>
    </>
  );
}
