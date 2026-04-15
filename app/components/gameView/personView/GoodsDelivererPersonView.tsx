import { GoodsDelivererPersonImmutable } from "~/game";
import { PersonViewProps } from "./PersonView";
import { MultilineText } from "~/components/generic";
import { useMemo } from "react";

export function GoodsDelivererPersonView({
  game,
  person,
}: PersonViewProps<GoodsDelivererPersonImmutable>) {
  const cell = game.grid.cellMap[person.positionKey];
  const center = useMemo(() => {
    return { x: cell.x * 20 + 10, y: cell.y * 20 + 10 };
  }, [cell]);
  const textLines = useMemo(() => {
    return [person.goodAmount, person.goodType];
  }, [person.goodAmount, person.goodType]);
  return (
    <g>
      <circle
        cx={cell.x * 20 + 10}
        cy={cell.y * 20 + 10}
        r={12}
        className={`person person-type-${person.type}`}
      />
      <MultilineText
        center={center}
        fill={"white"}
        fontSize={6}
        textLines={textLines}
      />
    </g>
  );
}
