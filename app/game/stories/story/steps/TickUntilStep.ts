import type { Game } from "~/game/Game";
import { BaseStoryStep, LimitedExpect, TestContext } from "./BaseStoryStep";
import { CheckStep } from "./CheckStep";
import assert from "assert";

export class TickUntilStep extends BaseStoryStep {
  maxTickCount: number;
  callback: (game: Game) => boolean;
  message: string;

  constructor(
    maxTickCount: number,
    callback: (game: Game) => boolean,
    message: string,
  ) {
    super();
    this.maxTickCount = maxTickCount;
    this.callback = callback;
    this.message = message;
  }

  run(game: Game, expect?: LimitedExpect) {
    for (let i = 0; i < this.maxTickCount; i++) {
      if (this.callback(game)) {
        return;
      }
      game.tick();
    }
    if (expect) {
      new CheckStep((_game) => {
        assert(
          false,
          `Expected behaviour '${this.message}' to happen within ${this.maxTickCount} ticks`,
        );
      }, this.message).run(game, expect);
    }
  }
}
