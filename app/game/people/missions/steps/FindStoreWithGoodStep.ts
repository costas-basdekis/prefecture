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
import { BaseMissionStep } from "./BaseMissionStep";

export class FindStoreWithGoodStep extends BaseMissionStep {
  readonly goodType: Good;
  readonly maxAmount: number;

  constructor(
    game: Game,
    person: BaseGridPerson<any, any>,
    goodType: Good,
    maxAmount: number,
  ) {
    super(game, person);
    this.goodType = goodType;
    this.maxAmount = maxAmount;
  }

  tick(
    _tickCount: number,
  ):
    | { done: false; result: null }
    | { done: true; result: { building: Building; path: Cell[] } } {
    const availableStores = Object.values(this.game.buildings.byId).filter(
      (building) =>
        WorkSearchUtils.hasWorkerAccess(building) &&
        ContentStoreUtils.hasAmount(
          building,
          this.goodType,
          this.maxAmount,
          true,
        ),
    ) as (Building & BuildingWithContents<any>)[];
    const closestBuildingAndPath = BaseBuilding.getClosestBuildingAndPath(
      availableStores,
      this.person.cell,
    );
    if (!closestBuildingAndPath) {
      return { done: false, result: null };
    }
    const [building, path] = closestBuildingAndPath;
    return { done: true, result: { building, path } };
  }
}
