import { mutable } from "~/immutable";
import {
  BuildingWithContents,
  ContentStoreUtils,
  WorkSearchUtils,
  type Building,
} from "../buildings";
import {
  BaseGridPersonImmutable,
  BaseGridPersonOptions,
  BaseGridPerson,
} from "./BaseGridPerson";
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
  "sourceBuildingId" | "targetBuildingId" | "goodType" | "goodAmount"
> &
  BaseGridPersonOptions;

export type GoodsDelivererPersonImmutable = Pick<
  GoodsDelivererPerson,
  "sourceBuildingId" | "targetBuildingId" | "goodType" | "goodAmount"
> &
  BaseGridPersonImmutable<GoodsDelivererPerson>;

export class GoodsDelivererPerson extends BaseGridPerson<
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
  path: Cell[] | null;
  pathIndex: number;
  @immutable
  goodType: Good;
  @mutable("plainValue")
  goodAmount: number;

  onFinished = this.eventsManager.add<(person: GoodsDelivererPerson) => void>();

  constructor(
    people: People,
    {
      sourceBuildingId,
      targetBuildingId,
      goodType,
      goodAmount,
      ...rest
    }: GoodsDelivererPersonOptions,
  ) {
    super(people, "goodsDeliverer", 1, rest);
    this.sourceBuildingId = sourceBuildingId;
    this.targetBuildingId = targetBuildingId;
    this.path = null;
    this.pathIndex = 0;
    this.goodType = goodType;
    this.goodAmount = goodAmount;
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
          this.onFinished.trigger(this);
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
        this.onFinished.trigger(this);
        this.remove();
        return;
      }
      this.targetBuilding = this.sourceBuilding;
      this.path = path;
      this.pathIndex = 0;
    }
  }
}
