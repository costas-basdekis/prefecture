import type { Building } from "~/game/buildings";
import type { Cell } from "~/game/Cell";
import { Game } from "~/game/Game";
import { BaseMissionStep } from "./BaseMissionStep";
import { BaseGridPerson } from "../../BaseGridPerson";

export class TravelOnPathStep extends BaseMissionStep {
  readonly targetBuilding: Building;
  readonly path: Cell[];
  pathIndex: number;

  constructor(
    game: Game,
    person: BaseGridPerson<any, any>,
    targetBuilding: Building,
    path: Cell[],
  ) {
    super(game, person);
    this.targetBuilding = targetBuilding;
    this.path = path;
    this.pathIndex = 0;
  }

  tick(
    _tickCount: number,
  ): { done: false; success: false } | { done: true; success: boolean } {
    if (this.targetBuilding.isRemoved()) {
      return { done: true, success: false };
    }
    if (this.pathIndex < this.path.length - 1) {
      this.pathIndex++;
      this.person.cell = this.path[this.pathIndex];
      return { done: false, success: false };
    }
    return { done: true, success: true };
  }
}
