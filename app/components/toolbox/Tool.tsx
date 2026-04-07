import type {
  HousePlacementTool,
  RoadPlacementTool,
  SelectionTool,
} from "./tools";

export type Tool = SelectionTool | RoadPlacementTool | HousePlacementTool;
export type ToolName = Tool["name"];
