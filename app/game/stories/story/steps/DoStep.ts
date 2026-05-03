import { Game } from "~/game/Game";
import { BaseStoryStep } from "./BaseStoryStep";

export class DoStep extends BaseStoryStep {
  callback: (game: Game) => void;

  constructor(callback: (game: Game) => void) {
    super();
    this.callback = callback;
  }

  run(game: Game) {
    this.callback(game);
  }
}
