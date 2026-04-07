import type { RoadPlacementTool, SelectionTool } from "./tools";

export type Tool = SelectionTool | RoadPlacementTool;
export type ToolName = Tool["name"];
