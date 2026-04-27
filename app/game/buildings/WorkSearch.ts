import {
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import { Building } from "./Building";
import { propById } from "~/utils";
import { Person, WandererPerson } from "../people";
import { Cell } from "../Cell";

export interface BuildingWithWorkSearch {
  workSearch: WorkSearch;
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
  building: Building & BuildingWithWorkSearch;
  @mutable("plainValue")
  workerFinderId: number | null;
  @propById<WorkSearch, WandererPerson, number>(
    "workerFinderId",
    (id, thisObject) =>
      thisObject.building.buildings.game.people.byId[id] as WandererPerson,
  )
  declare workerFinder: WandererPerson | null;
  lastWorkerFinderVisitedByCell: Map<Cell, number>;
  @mutable("plainValue")
  lastWorkerAccessTickCount: number;
  @mutable("plainValue")
  hasWorkerAccess: boolean;

  constructor(building: Building & BuildingWithWorkSearch) {
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
      this.workerFinder = new WandererPerson(
        this.building.buildings.game.people,
        {
          secondaryType: "workerFinder",
          sourceBuildingId: this.building.id,
          positionKey: firstCell.key,
          lastVisitedByCell: this.lastWorkerFinderVisitedByCell,
        },
      );
      this.workerFinder.onRemoved.register(
        this.onWorkerFinderFinished.bind(this),
      );
      this.workerFinder.onPassedHouse.register(
        this.onWorkerFinderPassedHouse.bind(this),
      );
    }
  }

  onWorkerFinderFinished(person: Person) {
    if (this.workerFinderId === person.id) {
      this.workerFinder = null;
    }
  }

  onWorkerFinderPassedHouse(tickCount: number) {
    this.lastWorkerAccessTickCount = tickCount;
    this.hasWorkerAccess = true;
  }
}

export const WorkSearchUtils = {
  hasWorkerAccess(building: Building): boolean {
    return (
      "workSearch" in building &&
      building.workSearch instanceof WorkSearch &&
      building.workSearch.hasWorkerAccess
    );
  },
};
