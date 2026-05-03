import { Story } from "./story";

export const allStories: Story[] = [];

export function addStory(story: Story): Story {
  allStories.push(story);
  return story;
}
