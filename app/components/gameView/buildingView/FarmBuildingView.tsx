import { BuildingViewProps } from "./BuildingView";
import { useMemo } from "react";
import { FarmBuildingImmutable } from "~/game";

export function FarmBuildingView({
  game,
  building,
}: BuildingViewProps<FarmBuildingImmutable>) {
  const center = useMemo(() => {
    return {
      x: (building.topLeftPosition.x + building.width / 2) * 20,
      y: (building.topLeftPosition.y + building.height / 2) * 20,
    };
  }, [building.topLeftPosition, building.width, building.height]);
  const textLines = useMemo(() => {
    return [
      building.crop,
      building.hasWorkerAccess ? `Has workers` : `No access to workers`,
      `(${game.tickCount - building.lastWorkerAccessTickCount} ticks ago)`,
      `${Math.floor(building.process * 100)}% completed`,
    ];
  }, [game.tickCount, building.crop, building.lastWorkerAccessTickCount]);
  return (
    <g className="farm">
      <rect
        className="building building-type-farm"
        x={building.topLeftPosition.x * 20}
        y={building.topLeftPosition.y * 20}
        width={20 * building.width}
        height={20 * building.height}
      ></rect>
      <text
        x={center.x}
        y={center.y}
        fill={"black"}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ pointerEvents: "none" }}
        fontSize={6}
      >
        {textLines.map((line, i) => (
          <tspan
            x={center.x}
            dy={i > 0 ? "1.2em" : `${(-1.2 * (textLines.length - 1)) / 2}em`}
            key={i}
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}
