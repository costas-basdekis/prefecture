import { Buildings } from "./Buildings";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import _ from "lodash";
import { makeCoordsKey } from "../Coords";
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
    for (const x of _.range(this.position.x - 3, this.position.x + 3)) {
      for (const y of _.range(this.position.y - 3, this.position.y + 3)) {
        const cell = this.buildings.game.grid.cellMap[makeCoordsKey({ x, y })];
        if (!cell) {
          continue;
        }
        cell.addWaterCoverage(this);
      }
    }
  }
}
