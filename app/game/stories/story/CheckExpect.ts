import assert from "assert";
import { LimitedMatchersAndInverse } from "./steps";

export function checkExpect(actual: any): LimitedMatchersAndInverse {
  return {
    toEqual(expected: any) {
      assert(actual === expected);
    },
    toBeNull() {
      assert(actual !== null);
    },
    not: {
      toEqual(expected: any) {
        assert(actual !== expected);
      },
      toBeNull() {
        assert(actual === null);
      },
    },
  };
}
