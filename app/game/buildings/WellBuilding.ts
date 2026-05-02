import type { Buildings } from "./Buildings";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import _ from "lodash";
import { immutable } from "~/immutable";
import type { WaterCoverageLevel } from "./WaterCoverage";

declare module "./Building" {
  interface BuildingDefinitions {
    well: WellBuilding;
  }
  interface BuildingImmutableDefinitions {
    well: WellBuildingImmutable;
  }
}

export type WellOptions = BaseBuildingOptions;

export type WellBuildingImmutable = BaseBuildingImmutable<WellBuilding>;

export class WellBuilding extends BaseBuilding<WellBuildingImmutable, "well"> {
  @immutable
  waterCoverage: WaterCoverageLevel;

  constructor(buildings: Buildings, options: BaseBuildingOptions) {
    super(buildings, "well", options);
    this.waterCoverage = 1;
    this.postInit();
    this.buildings.game.grid.waterCoverage.add(this, this.getCellsAround(3, 3));
  }
}
