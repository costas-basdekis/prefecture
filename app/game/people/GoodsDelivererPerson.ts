import { immutable, mutable } from "~/immutable";
import { BasePerson, BasePersonImmutable } from "./BasePerson";
import { propById } from "~/utils";
import type { Building } from "../buildings";
import type { People } from "./People";
import type { Cell } from "../Cell";
import type { Good } from "../goods";

export type GoodsDelivererPersonOptions = Pick<
  GoodsDelivererPerson,
  | "sourceBuildingId"
  | "targetBuildingId"
  | "positionKey"
  | "goodType"
  | "goodAmount"
>;

export type GoodsDelivererPersonImmutable = Pick<
  GoodsDelivererPerson,
  | "positionKey"
  | "sourceBuildingId"
  | "targetBuildingId"
  | "goodType"
  | "goodAmount"
> &
  BasePersonImmutable<GoodsDelivererPerson>;

export class GoodsDelivererPerson extends BasePerson<
  GoodsDelivererPerson,
  GoodsDelivererPersonImmutable,
  "goodsDeliverer"
> {
  @immutable
  sourceBuildingId: number;
  @propById(
    "sourceBuildingId",
    (id: number, thisObject: GoodsDelivererPerson) =>
      thisObject.people.game.buildings.byId[id],
  )
  declare sourceBuilding: Building;
  @immutable
  targetBuildingId: number | null;
  @propById(
    "targetBuildingId",
    (id: number, thisObject: GoodsDelivererPerson) =>
      thisObject.people.game.buildings.byId[id],
  )
  declare targetBuilding: Building | null;
  @immutable
  goodType: Good;
  @mutable("plainValue")
  goodAmount: number;
  @mutable("plainValue")
  positionKey: string;
  @propById(
    "positionKey",
    (key: string, thisObject: GoodsDelivererPerson) =>
      thisObject.people.game.grid.cellMap[key],
  )
  declare cell: Cell;

  constructor(
    people: People,
    {
      sourceBuildingId,
      targetBuildingId,
      positionKey,
      goodType,
      goodAmount,
    }: GoodsDelivererPersonOptions,
  ) {
    super(people, "goodsDeliverer");
    this.sourceBuildingId = sourceBuildingId;
    this.targetBuildingId = targetBuildingId;
    this.positionKey = positionKey;
    this.goodType = goodType;
    this.goodAmount = goodAmount;
    this.postInit();
  }
}
