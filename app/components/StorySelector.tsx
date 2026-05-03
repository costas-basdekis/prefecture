import { useCallback, ChangeEvent } from "react";
import { allStories, Game } from "~/game";

export interface StorySelectorProps {
  onGameChange: (game: Game) => void;
}

export function StorySelector({ onGameChange }: StorySelectorProps) {
  const onStorySelect = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const index = parseInt(e.target.value, 10);
      const story = allStories[index];
      if (!story) {
        return;
      }
      const game = story.runStory();
      onGameChange(game);
    },
    [allStories],
  );
  return (
    <div>
      <label>
        Predefined stories:{" "}
        <select onChange={onStorySelect} value={""}>
          <option>Select a story</option>
          {allStories.map((story, index) => (
            <option key={index} value={index}>
              {story.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
