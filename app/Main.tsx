import { ReactNode } from "react";
import { GameController } from "./components";

function GameSvg({ children }: { children: ReactNode }) {
  return (
    <svg className="flex-1 flex flex-col items-center" width={500} height={500}>
      {children}
    </svg>
  );
}

export function Main() {
  return (
    <main className="flex flex-col items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">Prefecture</header>
      </div>
      <GameController SvgComponent={GameSvg} />
    </main>
  );
}
