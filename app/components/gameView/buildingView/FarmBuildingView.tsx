import { BuildingViewProps } from "./BuildingView";
import { useMemo } from "react";
import { FarmBuildingImmutable } from "~/game";

export function FarmBuildingView({
  building,
}: BuildingViewProps<FarmBuildingImmutable>) {
  const center = useMemo(() => {
    return {
      x: building.position.x * 20 + 10,
      y: building.position.y * 20 + 10,
    };
  }, [building.position]);
  const text = useMemo(() => {
    return building.crop;
  }, [building.crop]);
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
