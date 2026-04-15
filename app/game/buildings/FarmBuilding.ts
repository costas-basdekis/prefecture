import { immutable, mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import type { Buildings } from "./Buildings";
import {
  WorkSearchImmutable,
  type BuildingWithWorkerFinder,
} from "./WorkSearch";
import { WorkSearch } from "./WorkSearch";
import {
  ProductionDelivery,
  ProductionDeliveryImmutable,
} from "./ProductionDelivery";
import type { FarmGood } from "../goods";
import {
  type BuildingWithProduction,
  Production,
  ProductionImmutable,
} from "./Production";

export type FarmBuildingOptions = Pick<FarmBuilding, "crop"> &
  BaseBuildingOptions;

export type FarmBuildingImmutable = Pick<FarmBuilding, "crop"> & {
  workSearch: WorkSearchImmutable;
  production: ProductionImmutable;
  productionDelivery: ProductionDeliveryImmutable;
} & BaseBuildingImmutable<FarmBuilding>;

export class FarmBuilding
  extends BaseBuilding<FarmBuilding, FarmBuildingImmutable, "farm">
  implements BuildingWithWorkerFinder, BuildingWithProduction
{
  @immutable
  crop: FarmGood;
  @mutable("mutable")
  workSearch: WorkSearch;
  @mutable("mutable")
  production: Production;
  @mutable("mutable")
  productionDelivery: ProductionDelivery;

  constructor(buildings: Buildings, options: FarmBuildingOptions) {
    super(buildings, "farm", options);
    this.crop = options.crop;
    this.workSearch = new WorkSearch(this);
    this.production = new Production(this, 0.1, 1);
    this.productionDelivery = new ProductionDelivery(this, this.crop);
    this.postInit();
  }

  tick(tickCount: number) {
    this.workSearch.tick(tickCount);
    this.production.tick(tickCount);
    this.productionDelivery.tick(tickCount);
  }
}
