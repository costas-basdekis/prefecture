import {
  immutable,
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import { Building } from "./Building";
import { Person } from "../people";
import { type Good } from "../goods";
import { BuildingWithProduction } from "./Production";
import { DeliverToAcceptingStoreMission } from "../people/missions";

export interface BuildingWithProductionDelivery {
  productionDelivery: ProductionDelivery;
}

export type ProductionDeliveryImmutable = Pick<
  ProductionDelivery,
  "goodType" | "goodsDelivererId"
> &
  Immutable<ProductionDelivery>;

export class ProductionDelivery implements Mutable<ProductionDeliveryImmutable> {
  mutationHelper: MutationHelper<
    ProductionDelivery,
    ProductionDeliveryImmutable
  >;
  @parentKey("productionDelivery")
  building: Building & BuildingWithProduction;
  @immutable
  goodType: Good;
  @mutable("plainValueById")
  goodsDeliverer: Person | null;
  declare goodsDelivererId: number | null;

  constructor(building: Building & BuildingWithProduction, goodType: Good) {
    this.building = building;
    this.goodType = goodType;
    this.goodsDeliverer = null;
    this.mutationHelper = new MutationHelper<
      ProductionDelivery,
      ProductionDeliveryImmutable
    >(this);
  }

  tick(_tickCount: number) {
    if (this.building.production.process >= 1 && !this.goodsDeliverer) {
      const firstCell = this.building.findFirstNeighbouringRoad();
      if (firstCell) {
        this.goodsDeliverer = DeliverToAcceptingStoreMission.makePerson(
          this.building.buildings.game.people,
          {
            cell: firstCell,
            goodType: this.goodType,
            goodAmount: 1,
          },
          {
            sourceBuilding: this.building,
          },
        );
        this.goodsDeliverer.onRemoved.register(
          this.goodsDelivererRemoved.bind(this),
        );
        this.building.production.process--;
      }
    }
  }

  goodsDelivererRemoved(person: Person) {
    if (this.goodsDeliverer === person) {
      this.goodsDeliverer = null;
    }
  }
}
