import type { Building } from "~/game/buildings";
import type { Cell } from "~/game/Cell";
import { Game } from "~/game/Game";
import { propById } from "~/utils";
import { BaseMissionStep } from "./BaseMissionStep";
import { BaseGridPerson } from "../../BaseGridPerson";

export class TravelOnPathStep extends BaseMissionStep {
  readonly targetBuildingId: number;
  @propById(
    "targetBuildingId",
    (id: number, thisObject: TravelOnPathStep) =>
      thisObject.game.buildings.byId[id],
    { allowSetter: false },
  )
  declare readonly targetBuilding: Building | null;
  readonly path: Cell[];
  pathIndex: number;

  constructor(
    game: Game,
    person: BaseGridPerson<any, any, any>,
    targetBuildingId: number,
    path: Cell[],
  ) {
    super(game, person);
    this.targetBuildingId = targetBuildingId;
    this.path = path;
    this.pathIndex = 0;
  }

  tick(
    _tickCount: number,
  ): { done: false; success: false } | { done: true; success: boolean } {
    if (!this.targetBuilding) {
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
