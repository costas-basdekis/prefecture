import { Buildings } from "./Buildings";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";

export type WellOptions = BaseBuildingOptions;

export type WellBuildingImmutable = BaseBuildingImmutable<WellBuilding>;

export class WellBuilding extends BaseBuilding<
  WellBuilding,
  WellBuildingImmutable,
  "well"
> {
  constructor(buildings: Buildings, options: BaseBuildingOptions) {
    super(buildings, "well", options);
  }
}
