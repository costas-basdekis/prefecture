import { immutable, mutable } from "~/immutable";
import type { People } from "./People";
import { propById } from "~/utils";
import type { BuildingWithWorkerFinder } from "../buildings";
import { BasePerson, BasePersonImmutable } from "./BasePerson";
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

export type WorkerFinderOptions = Pick<
  WorkerFinderPerson,
  "sourceBuildingId" | "positionKey"
>;

export type WorkerFinderPersonImmutable = Pick<
  WorkerFinderPerson,
  "positionKey"
> &
  BasePersonImmutable<WorkerFinderPerson>;

export class WorkerFinderPerson extends BasePerson<
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
    false,
  )
  declare sourceBuilding: BuildingWithWorkerFinder;
  @mutable("plainValue")
  positionKey: string;
  @propById(
    "positionKey",
    (positionKey: string, thisObject: WorkerFinderPerson) =>
      thisObject.people.game.grid.cellMap[positionKey],
    true,
    "key",
  )
  declare cell: Cell;
  @immutable
  firstTickCount: number;
  @immutable
  maxDuration: number;
  lastWorkerFinderVisitedByCell: Map<Cell, number>;

  constructor(
    people: People,
    { sourceBuildingId, positionKey }: WorkerFinderOptions,
  ) {
    super(people, "workerFinder");
    this.sourceBuildingId = sourceBuildingId;
    this.positionKey = positionKey;
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
      this.sourceBuilding.workSearch.workerFinderFinished();
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
        (cell) =>
          cell.building?.type === "house" && cell.building.occupantCount > 0,
      )
    ) {
      this.sourceBuilding.workSearch.workerFinderPassedHouse(
        this.people.game.tickCount,
      );
    }
  }
}
