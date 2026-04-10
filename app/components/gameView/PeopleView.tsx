import { GameImmutable } from "~/game";
import { PersonView } from "./PersonView";

export function PeopleView({ game }: { game: GameImmutable }) {
  return (
    <g className="people">
      {game.people.getPeople().map((person) => (
        <PersonView key={person.id} game={game} person={person} />
      ))}
    </g>
  );
}
