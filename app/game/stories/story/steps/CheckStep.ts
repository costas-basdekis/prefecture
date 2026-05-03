import type { Game } from "~/game/Game";
import { BaseStoryStep, LimitedExpect } from "./BaseStoryStep";

export class CheckStep extends BaseStoryStep {
  callback: (game: Game, expect: LimitedExpect) => void;
  message: string;

  constructor(
    callback: (game: Game, expect: LimitedExpect) => void,
    message: string,
  ) {
    super();
    this.callback = callback;
    this.message = message;
  }

  run(game: Game, expect?: LimitedExpect) {
    if (expect) {
      this.callback(game, expect);
    }
  }
}
