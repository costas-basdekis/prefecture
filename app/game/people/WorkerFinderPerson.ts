import { immutable } from "~/immutable";
import type { People } from "./People";
import { propById } from "~/utils";
import type { BuildingWithWorkerFinder, HouseUtils } from "../buildings";
import {
  BaseGridPersonImmutable,
  BaseGridPersonOptions,
  BaseGridPerson,
} from "./BaseGridPerson";
import _ from "lodash";
import { Cell } from "../Cell";

declare module "./Person" {
  interface PersonDefinitions {
    workerFinder: WorkerFinderPerson;
  }
  interface PersonImmutableDefinitions {
    workerFinder: WorkerFinderPersonImmutable;
  }
}

export type WorkerFinderOptions = Pick<WorkerFinderPerson, "sourceBuildingId"> &
  BaseGridPersonOptions;

export type WorkerFinderPersonImmutable =
  BaseGridPersonImmutable<WorkerFinderPerson>;

export class WorkerFinderPerson extends BaseGridPerson<
  WorkerFinderPerson,
  WorkerFinderPersonImmutable,
  "workerFinder"
> {
  @immutable
  sourceBuildingId: number;
  @propById(
    "sourceBuildingId",
    (id: number, thisObject: WorkerFinderPerson) =>
      thisObject.people.game.buildings.byId[id] as BuildingWithWorkerFinder,
    { allowSetter: false },
  )
  declare sourceBuilding: BuildingWithWorkerFinder;
  @immutable
  firstTickCount: number;
  @immutable
  maxDuration: number;
  lastWorkerFinderVisitedByCell: Map<Cell, number>;

  onPassedHouse = this.eventsManager.add<(tickCount: number) => void>();

  constructor(
    people: People,
    { sourceBuildingId, ...rest }: WorkerFinderOptions,
  ) {
    super(people, "workerFinder", 1, rest);
    this.sourceBuildingId = sourceBuildingId;
    this.firstTickCount = people.game.tickCount;
    this.maxDuration = 20;
    this.lastWorkerFinderVisitedByCell =
      this.sourceBuilding.workSearch.lastWorkerFinderVisitedByCell;
    this.lastWorkerFinderVisitedByCell.set(
      this.cell,
      this.people.game.tickCount,
    );
    this.postInit();
    this.checkForWorkerAccess();
  }

  tick(tickCount: number) {
    if (tickCount > this.firstTickCount + this.maxDuration) {
      this.remove();
      return;
    }
    const nextCells = Array.from(this.cell.getCellsAround(1, 1, false)).filter(
      (cell) => cell.hasRoad,
    );
    const nextCell = _.minBy(
      nextCells,
      (cell) => this.lastWorkerFinderVisitedByCell.get(cell) ?? 0,
    );
    if (!nextCell) {
      return;
    }
    this.cell = nextCell;
    this.lastWorkerFinderVisitedByCell.set(nextCell, tickCount);
    this.checkForWorkerAccess();
  }

  checkForWorkerAccess() {
    if (
      Array.from(this.cell.getCellsAround(2, 2, false)).some(
        HouseUtils.cellHasOccupants,
      )
    ) {
      this.onPassedHouse.trigger(this.people.game.tickCount);
    }
  }
}
