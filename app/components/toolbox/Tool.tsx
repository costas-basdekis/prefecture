import type {
  HousePlacementTool,
  RoadPlacementTool,
  SelectionTool,
} from "./tools";
import { WellPlacementTool } from "./tools/WellPlacementTool";

export type Tool =
  | SelectionTool
  | RoadPlacementTool
  | HousePlacementTool
  | WellPlacementTool;
export type ToolName = Tool["name"];
