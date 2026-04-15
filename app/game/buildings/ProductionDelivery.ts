import { Immutable, mutable, Mutable, MutationHelper } from "~/immutable";
import { Building } from "./Building";
import { propById } from "~/utils";
import { GoodsDelivererPerson } from "../people";
import { Good } from "../goods";

export type KeysWithGood<T> = keyof {
  [key in keyof T as T[key] extends Good ? key : never]: T[key];
};

export interface BuildingWithProduction {
  process: number;
}

export type ProductionDeliveryImmutable<
  B extends Building & BuildingWithProduction,
> = Immutable<ProductionDelivery<B>>;

export class ProductionDelivery<
  B extends Building & BuildingWithProduction,
> implements Mutable<ProductionDelivery<B>, ProductionDeliveryImmutable<B>> {
  mutationHelper: MutationHelper<
    ProductionDelivery<B>,
    ProductionDeliveryImmutable<B>
  >;
  building: B;
  goodKey: KeysWithGood<B>;
  @mutable("plainValue")
  goodsDelivererId: number | null;
  @propById<ProductionDelivery<B>, GoodsDelivererPerson, number>(
    "goodsDelivererId",
    (id, thisObject) =>
      thisObject.building.buildings.game.people.byId[
        id
      ] as GoodsDelivererPerson,
  )
  declare goodsDeliverer: GoodsDelivererPerson | null;

  constructor(building: B, goodKey: KeysWithGood<B>) {
    this.building = building;
    this.goodKey = goodKey;
    this.goodsDelivererId = null;
    this.mutationHelper = new MutationHelper<
      ProductionDelivery<B>,
      ProductionDeliveryImmutable<B>
    >(this);
  }

  tick(_tickCount: number) {
    if (this.building.process >= 1 && !this.goodsDelivererId) {
      const firstCell = this.building.findFirstNeighbouringRoad();
      if (firstCell) {
        this.goodsDeliverer = new GoodsDelivererPerson(
          this.building.buildings.game.people,
          {
            sourceBuildingId: this.building.id,
            targetBuildingId: null,
            positionKey: firstCell.key,
            goodType: this.building[this.goodKey] as Good,
            goodAmount: 1,
          },
        );
        this.building.process--;
      }
    }
  }
}
