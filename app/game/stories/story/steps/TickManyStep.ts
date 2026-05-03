import type { Game } from "~/game/Game";
import { BaseStoryStep } from "./BaseStoryStep";

export class TickManyStep extends BaseStoryStep {
  tickCount: number;

  constructor(tickCount: number) {
    super();
    this.tickCount = tickCount;
  }

  run(game: Game) {
    game.tickMany(this.tickCount);
  }
}
