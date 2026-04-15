import "./PersonView.css";
import { GameImmutable, PersonImmutable } from "~/game";
import { ImmigrantPersonView } from "./ImmigrantPersonView";
import { WorkerFinderPersonView } from "./WorkerFinderPersonView";
import { GoodsDelivererPersonView } from "./GoodsDelivererPersonView";

export interface PersonViewProps<P extends PersonImmutable> {
  game: GameImmutable;
  person: P;
}

export function PersonView({ game, person }: PersonViewProps<PersonImmutable>) {
  switch (person.type) {
    case "immigrant":
      return <ImmigrantPersonView game={game} person={person} />;
    case "workerFinder":
      return <WorkerFinderPersonView game={game} person={person} />;
    case "goodsDeliverer":
      return <GoodsDelivererPersonView game={game} person={person} />;
    default:
      throw new Error(`Unknown person type ${person["type"]}`);
  }
}
