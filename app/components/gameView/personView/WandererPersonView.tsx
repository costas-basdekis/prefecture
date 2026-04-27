import { WandererPersonImmutable } from "~/game";
import { PersonViewProps } from "./PersonView";
import { MultilineText } from "~/components/generic";
import { useMemo } from "react";
import { personViewByType } from "./personViewByType";

export function WandererPersonView({
  game,
  person,
}: PersonViewProps<WandererPersonImmutable>) {
  const cell = game.grid.cellMap[person.positionKey];
  const center = useMemo(() => {
    return { x: cell.x * 20 + 10, y: cell.y * 20 + 10 };
  }, [cell]);
  return (
    <g>
      <circle
        cx={center.x}
        cy={center.y}
        r={12}
        className={`person person-type-${person.type}-${person.secondaryType}`}
      />
      <MultilineText
        center={center}
        fill={"black"}
        fontSize={6}
        text={person.id}
      />
    </g>
  );
}

personViewByType.wanderer = WandererPersonView;
