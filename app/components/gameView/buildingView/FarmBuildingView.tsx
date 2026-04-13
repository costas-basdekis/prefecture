import { BuildingViewProps } from "./BuildingView";
import { useMemo } from "react";
import { FarmBuildingImmutable } from "~/game";

export function FarmBuildingView({
  building,
}: BuildingViewProps<FarmBuildingImmutable>) {
  const center = useMemo(() => {
    return {
      x: (building.topLeftPosition.x + building.width / 2) * 20,
      y: (building.topLeftPosition.y + building.height / 2) * 20,
    };
  }, [building.topLeftPosition, building.width, building.height]);
  const text = useMemo(() => {
    return building.crop;
  }, [building.crop]);
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
        {text}
      </text>
    </g>
  );
}
