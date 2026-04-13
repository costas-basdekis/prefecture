import { Buildings } from "./Buildings";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import _ from "lodash";
import { immutable } from "~/immutable";
import type { WaterCoverage } from "../Cell";

export type WellOptions = BaseBuildingOptions;

export type WellBuildingImmutable = BaseBuildingImmutable<WellBuilding>;

export class WellBuilding extends BaseBuilding<
  WellBuilding,
  WellBuildingImmutable,
  "well"
> {
  @immutable
  waterCoverage: WaterCoverage;

  constructor(buildings: Buildings, options: BaseBuildingOptions) {
    super(buildings, "well", options);
    this.waterCoverage = 1;
    this.postInit();
    for (const cell of this.getCellsAround(3, 3)) {
      cell.addWaterCoverage(this);
    }
  }
}
