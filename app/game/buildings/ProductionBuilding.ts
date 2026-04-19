import { immutable, Immutable, Mutable, mutable } from "~/immutable";
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
  BuildingWithProductionDelivery,
  ProductionDelivery,
  ProductionDeliveryImmutable,
} from "./ProductionDelivery";
import type { Good } from "../goods";
import {
  type BuildingWithProduction,
  Production,
  ProductionImmutable,
} from "./Production";

export type ProductionBuildingOptions = BaseBuildingOptions;

export type ProductionBuildingImmutable<
  B extends ProductionBuilding<any, any, any>,
> = Pick<B, "productionOutput"> & {
  workSearch: WorkSearchImmutable;
  production: ProductionImmutable;
  productionDelivery: ProductionDeliveryImmutable;
} & BaseBuildingImmutable<B>;

export abstract class ProductionBuilding<
  M extends Mutable<M, I>,
  I extends Immutable<M>,
  T extends string,
>
  extends BaseBuilding<
    ProductionBuilding<M, I, T>,
    ProductionBuildingImmutable<ProductionBuilding<M, I, T>>,
    T
  >
  implements
    BuildingWithWorkerFinder,
    BuildingWithProduction,
    BuildingWithProductionDelivery
{
  @mutable("mutable")
  workSearch: WorkSearch;
  @mutable("mutable")
  production: Production;
  @mutable("mutable")
  productionDelivery: ProductionDelivery;
  @immutable
  productionOutput: Good;

  constructor(
    buildings: Buildings,
    type: T,
    productionOutput: Good,
    options: ProductionBuildingOptions,
  ) {
    super(buildings, type, options);
    this.productionOutput = productionOutput;
    this.workSearch = new WorkSearch(this as any);
    this.production = new Production(this as any, 0.1, 1);
    this.productionDelivery = new ProductionDelivery(
      this as any,
      this.productionOutput,
    );
  }

  tick(tickCount: number) {
    this.workSearch.tick(tickCount);
    this.production.tick(tickCount);
    this.productionDelivery.tick(tickCount);
  }
}
