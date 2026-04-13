import { immutable, mutable } from "~/immutable";
import type { People } from "./People";
import { propById } from "~/utils";
import type { Building } from "../buildings";
import { BasePerson, BasePersonImmutable } from "./BasePerson";

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
      thisObject.people.game.buildings.byId[id],
    false,
  )
  declare sourceBuilding: Building;
  @mutable("plainValue")
  positionKey: string;
  @propById(
    "positionKey",
    (positionKey: string, thisObject: WorkerFinderPerson) =>
      thisObject.people.game.grid.cellMap[positionKey],
    false,
  )
  declare cell: Building;

  constructor(
    people: People,
    { sourceBuildingId, positionKey }: WorkerFinderOptions,
  ) {
    super(people, "workerFinder");
    this.sourceBuildingId = sourceBuildingId;
    this.positionKey = positionKey;
    this.postInit();
  }
}
