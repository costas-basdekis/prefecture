import { HouseBuildingImmutable } from "~/game/buildings";
import { BuildingViewProps } from "./BuildingView";
import { useMemo } from "react";

export function HouseBuildingView({
  building,
}: BuildingViewProps<HouseBuildingImmutable>) {
  const center = useMemo(() => {
    return {
      x: building.position.x * 20 + 10,
      y: building.position.y * 20 + 10,
    };
  }, [building.position]);
  const text = useMemo(() => {
    return `${building.level ?? "?"} (${building.occupantCount ?? "?"}/${building.maxOccupantCount ?? "?"})`;
  }, [building.level, building.occupantCount, building.maxOccupantCount]);
  return (
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
  );
}
