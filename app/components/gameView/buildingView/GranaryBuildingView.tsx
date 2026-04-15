import { BuildingViewProps } from "./BuildingView";
import { useMemo } from "react";
import { MultilineText } from "~/components/generic";
import { GranaryBuildingImmutable } from "~/game";

export function GranaryBuildingView({
  game,
  building,
}: BuildingViewProps<GranaryBuildingImmutable>) {
  const center = useMemo(() => {
    return {
      x: (building.topLeftPosition.x + building.width / 2) * 20,
      y: (building.topLeftPosition.y + building.height / 2) * 20,
    };
  }, [building.topLeftPosition, building.width, building.height]);
  const textLines = useMemo(() => {
    const contentsEntries = Object.entries(building.contents).filter(
      ([, amount]) => amount > 0,
    );
    return [
      building.workSearch.hasWorkerAccess
        ? `Has workers`
        : `No access to workers`,
      ...(contentsEntries.length
        ? contentsEntries.map(
            ([good, amount]) => `${Math.floor(amount * 100)} ${good}`,
          )
        : ["Empty"]),
    ];
  }, [
    game.tickCount,
    building.workSearch.hasWorkerAccess,
    building.workSearch.lastWorkerAccessTickCount,
    building.contents,
  ]);
  return (
    <g className="Granary">
      <rect
        className="building building-type-granary"
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
