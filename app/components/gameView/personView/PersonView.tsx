import "./PersonView.css";
import { GameImmutable, PersonImmutable } from "~/game";
import { personViewByType } from "./personViewByType";

export interface PersonViewProps<P extends PersonImmutable> {
  game: GameImmutable;
  person: P;
}

export function PersonView({ game, person }: PersonViewProps<PersonImmutable>) {
  const PersonViewForType = personViewByType[person.type];
  if (!PersonViewForType) {
    throw new Error(`Unknown person type ${person.type}`);
  }
  return <PersonViewForType game={game} person={person} />;
}
