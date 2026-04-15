import { BuildingViewProps } from "./BuildingView";
import { useMemo } from "react";
import { MultilineText } from "~/components/generic";
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
      building.workSearch.hasWorkerAccess
        ? `Has workers`
        : `No access to workers`,
      `(${game.tickCount - building.workSearch.lastWorkerAccessTickCount} ticks ago)`,
      `${Math.floor(building.production.process * 100)}% completed`,
    ];
  }, [
    game.tickCount,
    building.crop,
    building.workSearch.lastWorkerAccessTickCount,
    building.production.process,
  ]);
  return (
    <g className="farm">
      <rect
        className="building building-type-farm"
        x={building.topLeftPosition.x * 20}
        y={building.topLeftPosition.y * 20}
        width={20 * building.width}
        height={20 * building.height}
      ></rect>
      <MultilineText
        center={center}
        fill={"black"}
        fontSize={6}
        textLines={textLines}
      />
    </g>
  );
}
