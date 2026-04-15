import {
  immutable,
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import { Building } from "./Building";
import { propById } from "~/utils";
import { GoodsDelivererPerson } from "../people";
import { goods, type Good } from "../goods";
import { BuildingWithProduction } from "./Production";

export interface BuildingWithProductionDelivery {
  productionDelivery: ProductionDelivery;
}

export type ProductionDeliveryImmutable = Pick<
  ProductionDelivery,
  "goodType" | "goodsDelivererId"
> &
  Immutable<ProductionDelivery>;

export class ProductionDelivery implements Mutable<
  ProductionDelivery,
  ProductionDeliveryImmutable
> {
  mutationHelper: MutationHelper<
    ProductionDelivery,
    ProductionDeliveryImmutable
  >;
  @parentKey("productionDelivery")
  building: Building & BuildingWithProduction;
  @immutable
  goodType: Good;
  @mutable("plainValue")
  goodsDelivererId: number | null;
  @propById<ProductionDelivery, GoodsDelivererPerson, number>(
    "goodsDelivererId",
    (id, thisObject) =>
      thisObject.building.buildings.game.people.byId[
        id
      ] as GoodsDelivererPerson,
  )
  declare goodsDeliverer: GoodsDelivererPerson | null;

  constructor(building: Building & BuildingWithProduction, goodType: Good) {
    this.building = building;
    this.goodType = goodType;
    this.goodsDelivererId = null;
    this.mutationHelper = new MutationHelper<
      ProductionDelivery,
      ProductionDeliveryImmutable
    >(this);
  }

  tick(_tickCount: number) {
    if (this.building.production.process >= 1 && !this.goodsDelivererId) {
      const firstCell = this.building.findFirstNeighbouringRoad();
      if (firstCell) {
        this.goodsDeliverer = new GoodsDelivererPerson(
          this.building.buildings.game.people,
          {
            sourceBuildingId: this.building.id,
            targetBuildingId: null,
            positionKey: firstCell.key,
            goodType: this.goodType,
            goodAmount: 1,
          },
        );
        this.building.production.process--;
      }
    }
  }

  goodsDelivererFinished(goodsDeliverer: GoodsDelivererPerson) {
    if (this.goodsDeliverer === goodsDeliverer) {
      this.goodsDeliverer = null;
    }
  }
}
