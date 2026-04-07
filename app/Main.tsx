import { useState } from "react";
import { Grid } from "./game";
import { GridOverlayView, GridView } from "./components";

export function Main() {
  const [grid, setGrid] = useState(() => Grid.make({ width: 25, height: 25 }));
  return (
    <main className="flex flex-col items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">Prefecture</header>
      </div>
      <svg
        className="flex-1 flex flex-col items-center"
        width={1000}
        height={600}
      >
        <GridView grid={grid} />
        <GridOverlayView grid={grid} />
      </svg>
    </main>
  );
}
