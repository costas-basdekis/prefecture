import {
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import { Building } from "./Building";
import { propById } from "~/utils";
import { WorkerFinderPerson } from "../people";
import { Cell } from "../Cell";

export interface BuildingWithWorkerFinder {
  workSearch: WorkSearch;
  workerFinderFinished?(): void;
  workerFinderPassedHouse?(tickCount: number): void;
}

export const MaxWorkerAccessTickCount = 50;

export type WorkSearchImmutable = Pick<
  WorkSearch,
  "workerFinderId" | "lastWorkerAccessTickCount" | "hasWorkerAccess"
> &
  Immutable<WorkSearch>;

export class WorkSearch implements Mutable<WorkSearch, WorkSearchImmutable> {
  mutationHelper: MutationHelper<WorkSearch, WorkSearchImmutable>;
  @parentKey("workSearch")
  building: Building & BuildingWithWorkerFinder;
  @mutable("plainValue")
  workerFinderId: number | null;
  @propById<WorkSearch, WorkerFinderPerson, number>(
    "workerFinderId",
    (id, thisObject) =>
      thisObject.building.buildings.game.people.byId[id] as WorkerFinderPerson,
  )
  declare workerFinder: WorkerFinderPerson | null;
  lastWorkerFinderVisitedByCell: Map<Cell, number>;
  @mutable("plainValue")
  lastWorkerAccessTickCount: number;
  @mutable("plainValue")
  hasWorkerAccess: boolean;

  constructor(building: Building & BuildingWithWorkerFinder) {
    this.building = building;
    this.workerFinderId = null;
    this.lastWorkerFinderVisitedByCell = new Map();
    this.lastWorkerAccessTickCount = -Infinity;
    this.hasWorkerAccess = false;
    this.mutationHelper = new MutationHelper<WorkSearch, WorkSearchImmutable>(
      this,
    );
  }

  tick(tickCount: number) {
    if (tickCount - this.lastWorkerAccessTickCount > MaxWorkerAccessTickCount) {
      this.hasWorkerAccess = false;
    }
    this.spawnWorkerFinder();
  }

  spawnWorkerFinder() {
    if (!this.workerFinderId) {
      const firstCell = this.building.findFirstNeighbouringRoad();
      if (!firstCell) {
        return;
      }
      this.workerFinder = new WorkerFinderPerson(
        this.building.buildings.game.people,
        {
          sourceBuildingId: this.building.id,
          positionKey: firstCell.key,
        },
      );
    }
  }

  workerFinderFinished() {
    this.workerFinder = null;
    this.building.workerFinderFinished?.();
  }

  workerFinderPassedHouse(tickCount: number) {
    this.lastWorkerAccessTickCount = tickCount;
    this.hasWorkerAccess = true;
    this.building.workerFinderPassedHouse?.(tickCount);
  }
}
