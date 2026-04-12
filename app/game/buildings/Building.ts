import { FarmBuilding, FarmBuildingImmutable } from "./FarmBuilding";
import { HouseBuilding, HouseBuildingImmutable } from "./HouseBuilding";
import { WellBuilding, WellBuildingImmutable } from "./WellBuilding";

export type Building = HouseBuilding | WellBuilding | FarmBuilding;
export type BuildingImmutable =
  | HouseBuildingImmutable
  | WellBuildingImmutable
  | FarmBuildingImmutable;
