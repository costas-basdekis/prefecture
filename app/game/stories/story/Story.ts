import { Game } from "../../Game";
import { addStory } from "../allStories";
import { checkExpect } from "./CheckExpect";
import {
  BaseStoryStep,
  DoStep,
  CheckStep,
  TickManyStep,
  TickUntilStep,
  TestContext,
  LimitedExpect,
} from "./steps";

export class Story {
  name: string;
  steps: BaseStoryStep[];

  static add(name: string) {
    return addStory(new Story(name));
  }

  constructor(name: string) {
    this.name = name;
    this.steps = [];
  }

  do(callback: (game: Game) => void): this {
    this.steps.push(new DoStep(callback));
    return this;
  }

  check(
    callback: (game: Game, expect: LimitedExpect) => void,
    message: string,
  ): this {
    this.steps.push(new CheckStep(callback, message));
    return this;
  }

  tickMany(tickCount: number): this {
    this.steps.push(new TickManyStep(tickCount));
    return this;
  }

  tickUntil(
    maxTickCount: number,
    callback: (game: Game) => boolean | string,
    message: string,
  ): this {
    this.steps.push(new TickUntilStep(maxTickCount, callback, message));
    return this;
  }

  runStory(): Game {
    const game = new Game();
    for (const step of this.steps) {
      step.run(game);
    }
    return game;
  }

  testStory(testContext?: TestContext) {
    const game = new Game();
    if (testContext) {
      testContext.it(this.name, () => {
        for (const step of this.steps) {
          step.run(game, testContext.expect);
        }
      });
    } else {
      for (const step of this.steps) {
        step.run(game, checkExpect);
      }
    }
  }
}
