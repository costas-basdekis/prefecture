import type {
  FarmPlacementTool,
  HousePlacementTool,
  RoadPlacementTool,
  SelectionTool,
  WellPlacementTool,
} from "./tools";

export type Tool =
  | SelectionTool
  | RoadPlacementTool
  | HousePlacementTool
  | WellPlacementTool
  | FarmPlacementTool;
export type ToolName = Tool["name"];
