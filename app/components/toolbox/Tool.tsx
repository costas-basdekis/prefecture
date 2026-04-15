import type {
  FarmPlacementTool,
  GranaryPlacementTool,
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
  | FarmPlacementTool
  | GranaryPlacementTool;
export type ToolName = Tool["name"];
