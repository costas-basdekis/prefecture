import { useState } from "react";
import { Game } from "./game";
import { GameView, SelectionTool, Tool, ToolSelector } from "./components";

export function Main() {
  const [game, setGame] = useState(() => Game.make({ width: 25, height: 25 }));
  const [tool, setTool] = useState<Tool>(new SelectionTool());
  return (
    <main className="flex flex-col items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">Prefecture</header>
      </div>
      <ToolSelector tool={tool} onChange={setTool} />
      <svg
        className="flex-1 flex flex-col items-center"
        width={500}
        height={500}
      >
        <GameView game={game} setGame={setGame} tool={tool} />
      </svg>
    </main>
  );
}
