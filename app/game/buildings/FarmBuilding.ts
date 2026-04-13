import { immutable, mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import type { Buildings } from "./Buildings";
import { propById } from "~/utils";
import { type Person, WorkerFinderPerson } from "../people";

export type FarmBuildingOptions = { crop: "wheat" } & BaseBuildingOptions;

export type FarmBuildingImmutable = Pick<FarmBuilding, "crop"> &
  BaseBuildingImmutable<FarmBuilding>;

export class FarmBuilding extends BaseBuilding<
  FarmBuilding,
  FarmBuildingImmutable,
  "farm"
> {
  @immutable
  crop: "wheat";
  @mutable("plainValue")
  workerFinderId: number | null;
  @propById<FarmBuilding, WorkerFinderPerson, number>(
    "workerFinderId",
    (id, thisObject) =>
      thisObject.buildings.game.people.byId[id] as WorkerFinderPerson,
  )
  declare workerFinder: Person;

  constructor(buildings: Buildings, options: FarmBuildingOptions) {
    super(buildings, "farm", options);
    this.crop = options.crop;
    this.workerFinderId = null;
    this.postInit();
    this.spawnWorkerFinder();
  }

  tick() {
    this.spawnWorkerFinder();
  }

  spawnWorkerFinder() {
    if (!this.workerFinderId) {
      const firstCell = Array.from(this.getCellsAround(1, 1, false)).find(
        (cell) => cell.hasRoad,
      );
      if (!firstCell) {
        return;
      }
      this.workerFinder = new WorkerFinderPerson(this.buildings.game.people, {
        sourceBuildingId: this.id,
        positionKey: firstCell.key,
      });
    }
  }
}
