import { immutable, mutable } from "~/immutable";
import { BasePerson, BasePersonImmutable } from "./BasePerson";
import { propById } from "~/utils";
import {
  BuildingWithContents,
  BuildingWithProductionDelivery,
  ContentStoreUtils,
  WorkSearchUtils,
  type Building,
} from "../buildings";
import type { People } from "./People";
import type { Cell } from "../Cell";
import type { Good } from "../goods";

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
  | "speed"
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
  declare sourceBuilding: Building & BuildingWithProductionDelivery;
  @immutable
  targetBuildingId: number | null;
  @propById(
    "targetBuildingId",
    (id: number, thisObject: GoodsDelivererPerson) =>
      thisObject.people.game.buildings.byId[id],
  )
  declare targetBuilding: Building | null;
  path: Cell[] | null;
  pathIndex: number;
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
    true,
    "key",
  )
  declare cell: Cell;
  @immutable
  speed: number;

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
    this.path = null;
    this.pathIndex = 0;
    this.goodType = goodType;
    this.goodAmount = goodAmount;
    this.speed = 1;
    this.postInit();
  }

  tick(_tickCount: number): void {
    if (this.targetBuilding && this.path) {
      if (this.pathIndex < this.path.length - 1) {
        this.pathIndex++;
        this.cell = this.path[this.pathIndex];
      } else {
        if (this.goodAmount) {
          if (
            ContentStoreUtils.store(
              this.targetBuilding,
              this.goodType,
              this.goodAmount,
            )
          ) {
            this.goodAmount = 0;
          }
          this.path = null;
          this.pathIndex = 0;
        } else {
          this.sourceBuilding.productionDelivery.goodsDelivererFinished(this);
          this.remove();
        }
      }
    } else if (this.goodAmount) {
      const acceptingStores = Object.values(
        this.people.game.buildings.byId,
      ).filter(
        (building) =>
          WorkSearchUtils.hasWorkerAccess(building) &&
          ContentStoreUtils.hasRoomFor(
            building,
            this.goodType,
            this.goodAmount,
          ),
      ) as (Building & BuildingWithContents<any>)[];
      const reachableStoresAndPaths = acceptingStores
        .map((building) => [building, building.getPathFrom(this.cell)] as const)
        .filter(([, path]) => path) as [Building, Cell[]][];
      const closestBuildingAndPath = reachableStoresAndPaths.sort(
        ([, leftPath], [, rightPath]) => leftPath.length - rightPath.length,
      )[0];
      if (!closestBuildingAndPath) {
        return;
      }
      const [building, path] = closestBuildingAndPath;
      this.targetBuilding = building;
      this.path = path;
      this.pathIndex = 0;
    } else {
      const path = this.sourceBuilding.getPathFrom(this.cell);
      if (!path) {
        this.sourceBuilding.productionDelivery.goodsDelivererFinished(this);
        this.remove();
        return;
      }
      this.targetBuilding = this.sourceBuilding;
      this.path = path;
      this.pathIndex = 0;
    }
  }
}
