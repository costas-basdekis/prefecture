import {
  type Building,
  WorkSearchUtils,
  ContentStoreUtils,
  BuildingWithContents,
  BaseBuilding,
} from "../../../buildings";
import type { Cell } from "../../../Cell";
import { Game } from "../../../Game";
import type { Good } from "../../../goods";
import { BaseGridPerson } from "../../BaseGridPerson";
import { BaseMissionStep, MissionStepTick } from "./BaseMissionStep";

export class FindStoreWithSpaceStep extends BaseMissionStep {
  readonly goodType: Good;
  readonly goodAmount: number;

  constructor(
    game: Game,
    person: BaseGridPerson<any, any>,
    goodType: Good,
    goodAmount: number,
  ) {
    super(game, person);
    this.goodType = goodType;
    this.goodAmount = goodAmount;
  }

  tick(
    _tickCount: number,
  ): MissionStepTick<{ building: Building; path: Cell[] }> {
    const acceptingStores = Object.values(this.game.buildings.byId).filter(
      (building) =>
        WorkSearchUtils.hasWorkerAccess(building) &&
        ContentStoreUtils.hasRoomFor(
          building,
          this.goodType,
          this.goodAmount,
          true,
        ),
    ) as (Building & BuildingWithContents<any>)[];
    const closestBuildingAndPath = BaseBuilding.getClosestBuildingAndPath(
      acceptingStores,
      this.person.cell,
    );
    if (!closestBuildingAndPath) {
      return { done: false, result: null };
    }
    const [building, path] = closestBuildingAndPath;
    return { done: true, result: { building, path } };
  }
}
