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
  @propById<ProductionDelivery, Person, number>(
    "goodsDelivererId",
    (id, thisObject) =>
      thisObject.building.buildings.game.people.byId[id] as Person,
  )
  declare goodsDeliverer: Person | null;

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
        this.goodsDeliverer = DeliverToAcceptingStoreMission.makePerson(
          this.building.buildings.game.people,
          {
            positionKey: firstCell.key,
            goodType: this.goodType,
            goodAmount: 1,
          },
          {
            sourceBuildingId: this.building.id,
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
    if (this.goodsDelivererId === person.id) {
      this.goodsDeliverer = null;
    }
  }
}
