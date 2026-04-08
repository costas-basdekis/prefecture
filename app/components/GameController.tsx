import { FC, ReactNode, useState } from "react";
import { Game } from "~/game";
import { GameView } from "./gameView";
import { Tool, SelectionTool, ToolSelector } from "./toolbox";

export function GameController({
  initialGame,
  SvgComponent,
}: {
  initialGame?: Game;
  SvgComponent: FC<{ children: ReactNode }>;
}) {
  const [game, setGame] = useState(
    () => initialGame ?? Game.make({ width: 25, height: 25 }),
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
