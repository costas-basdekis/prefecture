import { WorkerFinderPersonImmutable } from "~/game";
import { PersonViewProps } from "./PersonView";

export function WorkerFinderPersonView({
  game,
  person,
}: PersonViewProps<WorkerFinderPersonImmutable>) {
  const cell = game.grid.cellMap[person.positionKey];
  return (
    <g>
      <circle
        cx={cell.x * 20 + 10}
        cy={cell.y * 20 + 10}
        r={12}
        className={`person person-type-${person.type}`}
        stroke="black"
        fill="white"
      />
      <text
        x={cell.x * 20 + 10}
        y={cell.y * 20 + 10}
        fill={"black"}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ pointerEvents: "none" }}
        fontSize={6}
      >
        {person.id}
      </text>
    </g>
  );
}
