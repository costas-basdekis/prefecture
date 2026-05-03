import type { Game } from "~/game/Game";
import { BaseStoryStep, LimitedExpect, TestContext } from "./BaseStoryStep";
import { checkExpect } from "../CheckExpect";

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

  run(game: Game, testContext?: TestContext) {
    if (testContext) {
      this.callback(game, testContext.expect);
    } else {
      this.callback(game, checkExpect);
    }
  }
}
