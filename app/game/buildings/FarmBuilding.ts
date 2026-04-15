import { immutable, mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import type { Buildings } from "./Buildings";
import { type BuildingWithWorkerFinder } from "./WorkSearch";
import { WorkSearch } from "./WorkSearch";
import {
  BuildingWithProduction,
  ProductionDelivery,
} from "./ProductionDelivery";
import type { FarmGood } from "../goods";

export type FarmBuildingOptions = Pick<FarmBuilding, "crop"> &
  BaseBuildingOptions;

export type FarmBuildingImmutable = Pick<
  FarmBuilding,
  "crop" | "workSearch" | "processRate" | "process" | "productionDelivery"
> &
  BaseBuildingImmutable<FarmBuilding>;

export class FarmBuilding
  extends BaseBuilding<FarmBuilding, FarmBuildingImmutable, "farm">
  implements BuildingWithWorkerFinder, BuildingWithProduction
{
  @immutable
  crop: FarmGood;
  @mutable("mutable")
  workSearch: WorkSearch;
  @immutable
  processRate: number;
  @mutable("plainValue")
  process: number;
  @mutable("mutable")
  productionDelivery: ProductionDelivery<FarmBuilding>;

  constructor(buildings: Buildings, options: FarmBuildingOptions) {
    super(buildings, "farm", options);
    this.crop = options.crop;
    this.workSearch = new WorkSearch(this);
    this.processRate = 0.1;
    this.process = 0;
    this.productionDelivery = new ProductionDelivery<FarmBuilding>(
      this,
      "crop",
    );
    this.postInit();
  }

  tick(tickCount: number) {
    this.workSearch.tick(tickCount);
    if (this.workSearch.hasWorkerAccess && this.process < 1) {
      this.process = Math.min(1, this.process + this.processRate);
    }
    this.productionDelivery.tick(tickCount);
  }
}
