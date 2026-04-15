import { useMemo } from "react";
import { ImmigrantPersonImmutable } from "~/game/people";
import { PersonViewProps } from "./PersonView";

export function ImmigrantPersonView({
  game,
  person,
}: PersonViewProps<ImmigrantPersonImmutable>) {
  const targetBuilding = useMemo(() => {
    return game.buildings.byId[person.targetBuildingId];
  }, [person.targetBuildingId, game.buildings.byId[person.targetBuildingId]]);
  const [startPoint, endPoint] = useMemo(() => {
    if (!targetBuilding) {
      return [null, null];
    }
    return [{ x: 0, y: 0 }, targetBuilding.positions[0]];
  }, [targetBuilding?.positions[0], person.targetBuildingId]);
  const position = useMemo(() => {
    if (!startPoint || !endPoint) {
      return null;
    }
    return {
      x: (endPoint.x - startPoint.x) * person.completion,
      y: (endPoint.y - startPoint.y) * person.completion,
    };
  }, [startPoint, endPoint, person.completion]);
  if (!position) {
    return;
  }
  return (
    <circle
      cx={position.x * 20 + 10}
      cy={position.y * 20 + 10}
      r={12}
      className={`person person-type-${person.type}`}
    />
  );
}
