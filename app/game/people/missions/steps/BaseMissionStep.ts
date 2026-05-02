import { Game } from "../../../Game";
import { BaseGridPerson } from "../../BaseGridPerson";

export type MissionStepTick<R> =
  | { done: false; result: null }
  | { done: true; result: R };

export abstract class BaseMissionStep<
  P extends BaseGridPerson<any, any> = BaseGridPerson<any, any>,
> {
  readonly game: Game;
  readonly person: P;

  constructor(game: Game, person: P) {
    this.game = game;
    this.person = person;
  }

  abstract tick(tickCount: number): any;
}
