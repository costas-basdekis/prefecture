import { immutable, mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import type { Buildings } from "./Buildings";
import { type BuildingWithWorkerFinder } from "./WorkSearch";
import { WorkSearch } from "./WorkSearch";
import { ProductionDelivery } from "./ProductionDelivery";
import type { FarmGood } from "../goods";
import {
  type BuildingWithProduction,
  Production,
  ProductionImmutable,
} from "./Production";

export type FarmBuildingOptions = Pick<FarmBuilding, "crop"> &
  BaseBuildingOptions;

export type FarmBuildingImmutable = Pick<
  FarmBuilding,
  "crop" | "workSearch" | "productionDelivery"
> & {
  production: ProductionImmutable<FarmBuilding>;
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
  production: Production<FarmBuilding>;
  @mutable("mutable")
  productionDelivery: ProductionDelivery<FarmBuilding>;

  constructor(buildings: Buildings, options: FarmBuildingOptions) {
    super(buildings, "farm", options);
    this.crop = options.crop;
    this.workSearch = new WorkSearch(this);
    this.production = new Production<FarmBuilding>(this, 0.1, 1);
    this.productionDelivery = new ProductionDelivery<FarmBuilding>(
      this,
      "crop",
    );
    this.postInit();
  }

  tick(tickCount: number) {
    this.workSearch.tick(tickCount);
    this.production.tick(tickCount);
    this.productionDelivery.tick(tickCount);
  }
}
