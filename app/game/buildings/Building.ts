import { HouseBuilding, HouseBuildingImmutable } from "./HouseBuilding";
import { WellBuilding, WellBuildingImmutable } from "./WellBuilding";

export type Building = HouseBuilding | WellBuilding;
export type BuildingImmutable = HouseBuildingImmutable | WellBuildingImmutable;
