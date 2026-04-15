import { FarmBuilding, FarmBuildingImmutable } from "./FarmBuilding";
import { GranaryBuilding, GranaryBuildingImmutable } from "./GranaryBuilding";
import { HouseBuilding, HouseBuildingImmutable } from "./HouseBuilding";
import { WellBuilding, WellBuildingImmutable } from "./WellBuilding";

export type Building =
  | HouseBuilding
  | WellBuilding
  | FarmBuilding
  | GranaryBuilding;
export type BuildingImmutable =
  | HouseBuildingImmutable
  | WellBuildingImmutable
  | FarmBuildingImmutable
  | GranaryBuildingImmutable;
