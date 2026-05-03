import { allStories } from ".";
import { TestContext } from "./story";

describe("Test all stories", () => {
  const testContext = { expect, it: it as TestContext["it"] };
  expect(allStories.length).toBeGreaterThan(0);
  for (const story of allStories) {
    describe(story.name, () => {
      story.testStory(testContext);
    });
  }
});
