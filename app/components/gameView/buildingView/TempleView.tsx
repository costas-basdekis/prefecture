import { BuildingViewProps } from "./BuildingView";
import { useMemo } from "react";
import { MultilineText } from "~/components/generic";
import { TempleBuildingImmutable } from "~/game";
import { buildingViewByType } from "./buildingViewByType";

export function TempleBuildingView({
  game,
  building,
}: BuildingViewProps<TempleBuildingImmutable>) {
  const center = useMemo(() => {
    return {
      x: (building.topLeftPosition.x + building.width / 2) * 20,
      y: (building.topLeftPosition.y + building.height / 2) * 20,
    };
  }, [building.topLeftPosition, building.width, building.height]);
  const textLines = useMemo(() => {
    return [
      building.workSearch.hasWorkerAccess
        ? `Has workers`
        : `No access to workers`,
    ];
  }, [
    game.tickCount,
    building.workSearch.hasWorkerAccess,
    building.workSearch.lastWorkerAccessTickCount,
  ]);
  return (
    <g className="Market">
      <rect
        className="building building-type-temple"
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

buildingViewByType.temple = TempleBuildingView;
