import type { Buildings } from "./Buildings";
import type { FarmGood } from "../goods";
import {
  ProductionBuilding,
  ProductionBuildingImmutable,
  ProductionBuildingOptions,
} from "./ProductionBuilding";

declare module "./Building" {
  interface BuildingDefinitions {
    farm: FarmBuilding;
  }
  interface BuildingImmutableDefinitions {
    farm: FarmBuildingImmutable;
  }
}

export type FarmBuildingOptions = Pick<FarmBuilding, "productionOutput"> &
  ProductionBuildingOptions;

export type FarmBuildingImmutable = ProductionBuildingImmutable<FarmBuilding>;

export class FarmBuilding extends ProductionBuilding<
  FarmBuilding,
  FarmBuildingImmutable,
  "farm"
> {
  declare productionOutput: FarmGood;

  constructor(buildings: Buildings, options: FarmBuildingOptions) {
    super(buildings, "farm", options.productionOutput, options);
    this.postInit();
  }
}
