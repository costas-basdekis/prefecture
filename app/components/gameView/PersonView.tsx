import { useMemo } from "react";
import { GameImmutable } from "~/game";
import { PersonImmutable } from "~/game/people";

export function PersonView({
  game,
  person,
}: {
  game: GameImmutable;
  person: PersonImmutable;
}) {
  const targetBuilding = useMemo(() => {
    return game.buildings.byId[person.targetBuildingId];
  }, [person.targetBuildingId, game.buildings.byId[person.targetBuildingId]]);
  const [startPoint, endPoint] = useMemo(() => {
    if (!targetBuilding) {
      return [null, null];
    }
    return [{ x: 0, y: 0 }, targetBuilding.position];
  }, [targetBuilding?.position, person.targetBuildingId]);
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
      cx={position.x}
      cy={position.y}
      r={12}
      stroke="black"
      fill="white"
    />
  );
}
