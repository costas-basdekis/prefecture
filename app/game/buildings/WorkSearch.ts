import {
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import { Building } from "./Building";
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
  @mutable("plainValueById")
  workerFinder: WandererPerson | null;
  declare workerFinderId: number | null;
  lastWorkerFinderVisitedByCell: Map<Cell, number>;
  @mutable("plainValue")
  lastWorkerAccessTickCount: number;
  @mutable("plainValue")
  hasWorkerAccess: boolean;

  constructor(building: Building & BuildingWithWorkSearch) {
    this.building = building;
    this.workerFinder = null;
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
    if (!this.workerFinder) {
      const firstCell = this.building.findFirstNeighbouringRoad();
      if (!firstCell) {
        return;
      }
      this.workerFinder = new WandererPerson(
        this.building.buildings.game.people,
        {
          secondaryType: "workerFinder",
          sourceBuilding: this.building,
          cell: firstCell,
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
    if (this.workerFinder === person) {
      this.workerFinder = null;
    }
  }

  onWorkerFinderPassedHouse(
    _passedHouseCells: Cell[],
    _person: WandererPerson,
    tickCount: number,
  ) {
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
