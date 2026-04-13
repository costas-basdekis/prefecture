import { GameImmutable } from "~/game";
import { PersonView } from "./personView";

export function PeopleView({ game }: { game: GameImmutable }) {
  return (
    <g className="people">
      {game.people.getPeople().map((person) => (
        <PersonView key={person.id} game={game} person={person} />
      ))}
    </g>
  );
}
