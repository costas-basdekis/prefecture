import { immutable, mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import type { Buildings } from "./Buildings";
import { propById } from "~/utils";
import { GoodsDelivererPerson } from "../people";
import { type BuildingWithWorkerFinder } from "./WorkSearch";
import { WorkSearch } from "./WorkSearch";

export type FarmBuildingOptions = Pick<FarmBuilding, "crop"> &
  BaseBuildingOptions;

export type FarmBuildingImmutable = Pick<
  FarmBuilding,
  "crop" | "workSearch" | "processRate" | "process"
> &
  BaseBuildingImmutable<FarmBuilding>;

export class FarmBuilding
  extends BaseBuilding<FarmBuilding, FarmBuildingImmutable, "farm">
  implements BuildingWithWorkerFinder
{
  @immutable
  crop: "wheat";
  @mutable("mutable")
  workSearch: WorkSearch;
  @immutable
  processRate: number;
  @mutable("plainValue")
  process: number;
  @mutable("plainValue")
  goodsDelivererId: number | null;
  @propById<FarmBuilding, GoodsDelivererPerson, number>(
    "goodsDelivererId",
    (id, thisObject) =>
      thisObject.buildings.game.people.byId[id] as GoodsDelivererPerson,
  )
  declare goodsDeliverer: GoodsDelivererPerson | null;

  constructor(buildings: Buildings, options: FarmBuildingOptions) {
    super(buildings, "farm", options);
    this.crop = options.crop;
    this.workSearch = new WorkSearch(this);
    this.processRate = 0.1;
    this.process = 0;
    this.goodsDelivererId = null;
    this.postInit();
  }

  tick(tickCount: number) {
    this.workSearch.tick(tickCount);
    if (this.workSearch.hasWorkerAccess && this.process < 1) {
      this.process = Math.min(1, this.process + this.processRate);
    }
    if (this.process === 1 && !this.goodsDelivererId) {
      const firstCell = this.findFirstNeighbouringRoad();
      if (firstCell) {
        this.goodsDeliverer = new GoodsDelivererPerson(
          this.buildings.game.people,
          {
            sourceBuildingId: this.id,
            targetBuildingId: null,
            positionKey: firstCell.key,
            goodType: this.crop,
            goodAmount: 1,
          },
        );
        this.process = 0;
      }
    }
  }
}
