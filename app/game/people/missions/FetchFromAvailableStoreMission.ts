import { unreachableCase } from "~/utils";
import { ContentStoreUtils } from "../../buildings";
import type { Cell } from "../../Cell";
import { Game } from "../../Game";
import type { Good } from "../../goods";
import {
  GoodsDelivererPersonOptions,
  GoodsDelivererPerson,
} from "../GoodsDelivererPerson";
import type { People } from "../People";
import { BaseGoodsDelivererMission } from "./BaseGoodsDelivererMission";
import { FindStoreWithGoodStep, TravelOnPathStep } from "./steps";

export type FetchFromAvailableStoreMissionOptions = {
  sourceBuildingId: number;
  goodType: Good;
  maxAmount: number;
};

export class FetchFromAvailableStoreMission extends BaseGoodsDelivererMission {
  readonly goodType: Good;
  readonly maxAmount: number;
  stateAndStep: Readonly<
    | { state: "findSource"; step: FindStoreWithGoodStep }
    | { state: "pickUpFromTarget"; step: TravelOnPathStep }
    | { state: "findWayBack"; step: null }
    | { state: "returnBack"; step: TravelOnPathStep }
    | { state: "done"; step: null }
  >;

  static makePerson(
    people: People,
    peopleOptions: Omit<GoodsDelivererPersonOptions, "mission">,
    missionOptions: FetchFromAvailableStoreMissionOptions,
  ): GoodsDelivererPerson {
    return super.makePerson(people, peopleOptions, missionOptions);
  }

  constructor(
    game: Game,
    person: GoodsDelivererPerson,
    {
      sourceBuildingId,
      goodType,
      maxAmount,
    }: FetchFromAvailableStoreMissionOptions,
  ) {
    super(game, person, { sourceBuildingId });
    this.goodType = goodType;
    this.maxAmount = maxAmount;
    this.stateAndStep = this.findSource();
  }

  tick(_tickCount: number): boolean {
    const { state, step } = this.stateAndStep;
    switch (state) {
      case "findSource": {
        const { done, result } = step.tick(_tickCount);
        if (!done) {
          break;
        }
        const { building, path } = result;
        this.stateAndStep = this.pickUpFromTarget(building.id, path);
        break;
      }
      case "pickUpFromTarget": {
        const { done, success } = step.tick(_tickCount);
        if (!done) {
          break;
        }
        if (!success) {
          this.stateAndStep = this.findSource();
          break;
        }

        const amount = ContentStoreUtils.take(
          step.targetBuilding!,
          this.goodType,
          this.maxAmount,
          true,
        );
        if (!amount) {
          this.stateAndStep = this.findSource();
          break;
        }
        this.person.goodAmount = amount;
        this.stateAndStep = this.findWayBack();
        break;
      }
      case "findWayBack": {
        this.stateAndStep = this.findWayBackOrDone();
        break;
      }
      case "returnBack": {
        const { done, success } = step.tick(_tickCount);
        if (!done) {
          break;
        }
        if (!success) {
          this.stateAndStep = this.findWayBackOrDone();
          break;
        }
        if (!this.sourceBuilding) {
          this.stateAndStep = this.done();
          break;
        }
        if (
          !ContentStoreUtils.hasRoomFor(
            this.sourceBuilding,
            this.person.goodType,
            this.person.goodAmount,
            false,
          )
        ) {
          break;
        }
        ContentStoreUtils.store(
          this.sourceBuilding,
          this.person.goodType,
          this.person.goodAmount,
          false,
        );
        this.person.goodAmount = 0;
        this.stateAndStep = this.done();
        break;
      }
      case "done":
        break;
      default:
        throw unreachableCase(state, `Unknown state ${state}`);
    }
    return this.stateAndStep.state === "done";
  }

  findSource(): this["stateAndStep"] {
    return {
      state: "findSource",
      step: new FindStoreWithGoodStep(
        this.game,
        this.person,
        this.goodType,
        this.maxAmount,
      ),
    };
  }

  pickUpFromTarget(buildingId: number, path: Cell[]): this["stateAndStep"] {
    return {
      state: "pickUpFromTarget",
      step: new TravelOnPathStep(this.game, this.person, buildingId, path),
    };
  }

  findWayBack(): this["stateAndStep"] {
    return { state: "findWayBack", step: null };
  }

  returnBack(path: Cell[]): this["stateAndStep"] {
    return {
      state: "returnBack",
      step: new TravelOnPathStep(
        this.game,
        this.person,
        this.sourceBuildingId,
        path,
      ),
    };
  }

  findWayBackOrDone(): this["stateAndStep"] {
    if (!this.sourceBuilding) {
      return this.done();
    }
    const path = this.sourceBuilding.getPathFrom(this.person.cell);
    if (!path) {
      return this.findWayBack();
    }
    return this.returnBack(path);
  }
}
