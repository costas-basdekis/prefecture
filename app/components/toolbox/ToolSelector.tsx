import { useCallback, ChangeEvent, useMemo } from "react";
import { Coords, GameImmutable } from "../../game";
import { toolsByName } from "./tools";
import { Tool, ToolName } from "./tools/Tool";
import _ from "lodash";

const toolOrder: ToolName[] = [
  "selection",
  "road-placement",
  "house-placement",
  "well-placement",
  "farm-placement",
  "granary-placement",
];

export function ToolSelector({
  tool,
  onChange,
}: {
  tool: Tool;
  onChange: (tool: Tool) => void;
}) {
  const innerOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const toolName = e.target.value as ToolName;
      const toolForName = toolsByName[toolName];
      if (!toolForName) {
        throw new Error(`Unknown tool ${toolName}`);
      }
      onChange(toolForName);
    },
    [onChange],
  );
  const orderedTools = useMemo(() => {
    return _.sortBy(Object.values(toolsByName), (tool) => {
      const order = toolOrder.indexOf(tool.name);
      return order === -1 ? Infinity : order;
    });
  }, []);
  return (
    <>
      <div>
        {orderedTools.map((displayTool) => (
          <label key={displayTool.name}>
            <input
              type={"radio"}
              value={displayTool.name}
              checked={tool.name === displayTool.name}
              onChange={innerOnChange}
            />
            {displayTool.label}
          </label>
        ))}
      </div>
      <tool.renderOptions onChange={onChange} />
    </>
  );
}
export interface OnSelectionProps {
  game: GameImmutable;
  setGame: React.Dispatch<React.SetStateAction<GameImmutable>>;
  startCoords: Coords;
  endCoords: Coords;
  allCoords: Coords[];
}
