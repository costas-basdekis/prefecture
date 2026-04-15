import { immutable, mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import type { Buildings } from "./Buildings";
import { propById } from "~/utils";
import { GoodsDelivererPerson, WorkerFinderPerson } from "../people";
import {
  type BuildingWithWorkerFinder,
  MaxWorkerAccessTickCount,
} from "./BuildingWithWorkerFinder";
import { Cell } from "../Cell";

export type FarmBuildingOptions = Pick<FarmBuilding, "crop"> &
  BaseBuildingOptions;

export type FarmBuildingImmutable = Pick<
  FarmBuilding,
  | "crop"
  | "workerFinderId"
  | "lastWorkerAccessTickCount"
  | "hasWorkerAccess"
  | "processRate"
  | "process"
> &
  BaseBuildingImmutable<FarmBuilding>;

export class FarmBuilding
  extends BaseBuilding<FarmBuilding, FarmBuildingImmutable, "farm">
  implements BuildingWithWorkerFinder
{
  @immutable
  crop: "wheat";
  @mutable("plainValue")
  workerFinderId: number | null;
  @propById<FarmBuilding, WorkerFinderPerson, number>(
    "workerFinderId",
    (id, thisObject) =>
      thisObject.buildings.game.people.byId[id] as WorkerFinderPerson,
  )
  declare workerFinder: WorkerFinderPerson | null;
  lastWorkerFinderVisitedByCell: Map<Cell, number>;
  @mutable("plainValue")
  lastWorkerAccessTickCount: number;
  @mutable("plainValue")
  hasWorkerAccess: boolean;
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
    this.workerFinderId = null;
    this.lastWorkerFinderVisitedByCell = new Map();
    this.lastWorkerAccessTickCount = -Infinity;
    this.hasWorkerAccess = false;
    this.processRate = 0.1;
    this.process = 0;
    this.goodsDelivererId = null;
    this.postInit();
    this.spawnWorkerFinder();
  }

  tick(tickCount: number) {
    if (tickCount - this.lastWorkerAccessTickCount > MaxWorkerAccessTickCount) {
      this.hasWorkerAccess = false;
    }
    this.spawnWorkerFinder();
    if (this.hasWorkerAccess && this.process < 1) {
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

  spawnWorkerFinder() {
    if (!this.workerFinderId) {
      const firstCell = this.findFirstNeighbouringRoad();
      if (!firstCell) {
        return;
      }
      this.workerFinder = new WorkerFinderPerson(this.buildings.game.people, {
        sourceBuildingId: this.id,
        positionKey: firstCell.key,
      });
    }
  }

  workerFinderFinished() {
    this.workerFinder = null;
  }

  workerFinderPassedHouse(tickCount: number) {
    this.lastWorkerAccessTickCount = tickCount;
    this.hasWorkerAccess = true;
  }
}
