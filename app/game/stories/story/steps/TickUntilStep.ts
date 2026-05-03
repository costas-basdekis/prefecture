import type { Game } from "~/game/Game";
import { BaseStoryStep, LimitedExpect } from "./BaseStoryStep";
import assert from "assert";

export class TickUntilStep extends BaseStoryStep {
  maxTickCount: number;
  callback: (game: Game) => boolean | string;
  message: string;

  constructor(
    maxTickCount: number,
    callback: (game: Game) => boolean | string,
    message: string,
  ) {
    super();
    this.maxTickCount = maxTickCount;
    this.callback = callback;
    this.message = message;
  }

  run(game: Game, expect?: LimitedExpect) {
    for (let i = 0; i < this.maxTickCount; i++) {
      if (this.callback(game) === true) {
        return;
      }
      game.tick();
    }
    const maybeReason = this.callback(game);
    if (maybeReason === true) {
      return;
    }
    if (expect) {
      let message = `Expected behaviour '${this.message}' to happen within ${this.maxTickCount} ticks`;
      if (typeof maybeReason === "string") {
        message = `${message}, but: ${maybeReason}`;
      }
      assert(false, message);
    }
  }
}
