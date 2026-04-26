import { Game } from "../Game";
import { Person } from "./Person";

export abstract class BasePersonMission<P extends Person> {
  readonly game: Game;
  readonly person: P;

  constructor(game: Game, person: P) {
    this.game = game;
    this.person = person;
  }

  abstract tick(tickCount: number): boolean;

  done(): { state: "done"; step: null } {
    return { state: "done", step: null };
  }
}
