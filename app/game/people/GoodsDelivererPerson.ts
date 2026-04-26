import { mutable } from "~/immutable";
import {
  BaseGridPersonImmutable,
  BaseGridPersonOptions,
  BaseGridPerson,
} from "./BaseGridPerson";
import type { People } from "./People";
import type { Good } from "../goods";
import { DeliverToAcceptingStoreMission } from "./missions";

declare module "./Person" {
  interface PersonDefinitions {
    goodsDeliverer: GoodsDelivererPerson;
  }
  interface PersonImmutableDefinitions {
    goodsDeliverer: GoodsDelivererPersonImmutable;
  }
}

export type GoodsDelivererPersonOptions = Pick<
  GoodsDelivererPerson,
  "goodType" | "goodAmount" | "mission"
> &
  BaseGridPersonOptions;

export type GoodsDelivererPersonImmutable = Pick<
  GoodsDelivererPerson,
  "goodType" | "goodAmount"
> &
  BaseGridPersonImmutable<GoodsDelivererPerson>;

export type GoodsDelivererPersonMission = DeliverToAcceptingStoreMission;

export class GoodsDelivererPerson extends BaseGridPerson<
  GoodsDelivererPerson,
  GoodsDelivererPersonImmutable,
  "goodsDeliverer"
> {
  @mutable("plainValue")
  goodType: Good;
  @mutable("plainValue")
  goodAmount: number;
  mission: GoodsDelivererPersonMission;

  onFinished = this.eventsManager.add<(person: GoodsDelivererPerson) => void>();

  constructor(
    people: People,
    { goodType, goodAmount, mission, ...rest }: GoodsDelivererPersonOptions,
  ) {
    super(people, "goodsDeliverer", 1, rest);
    this.mission = mission;
    this.goodType = goodType;
    this.goodAmount = goodAmount;
    this.postInit();
  }

  tick(_tickCount: number): void {
    if (this.mission.tick(_tickCount)) {
      this.onFinished.trigger(this);
      this.remove();
    }
  }
}
