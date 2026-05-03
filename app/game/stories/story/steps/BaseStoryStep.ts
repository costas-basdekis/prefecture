import { Game } from "~/game/Game";
import type { Inverse, Matchers } from "expect";
import type { Global } from "@jest/types";

export type LimitedMatchers = Pick<Matchers<any, any>, "toEqual" | "toBeNull">;

export type LimitedMatchersAndInverse = LimitedMatchers &
  Inverse<LimitedMatchers>;

export type LimitedExpect = (actual: any) => LimitedMatchersAndInverse;

export interface TestContext {
  expect: LimitedExpect;
  it: Global.It;
}

export abstract class BaseStoryStep {
  abstract run(game: Game, testContext?: TestContext): void;
}
