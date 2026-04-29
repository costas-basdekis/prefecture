import { unreachableCase } from "~/utils";
import { Building, ContentStoreUtils } from "../../buildings";
import type { Cell } from "../../Cell";
import { Game } from "../../Game";
import type { Good } from "../../goods";
import {
  GoodsDelivererPersonOptions,
  GoodsDelivererPerson,
} from "../GoodsDelivererPerson";
import { TravelOnPathStep } from "./steps/TravelOnPathStep";
import {
  BaseGoodsDelivererMission,
  BaseGoodsDelivererMissionOptions,
} from "./BaseGoodsDelivererMission";
import type { People } from "../People";
import { FindStoreWithSpaceStep } from "./steps";

export type DeliverToAcceptingStoreMissionOptions =
  BaseGoodsDelivererMissionOptions;

export class DeliverToAcceptingStoreMission extends BaseGoodsDelivererMission {
  readonly goodType: Good;
  readonly goodAmount: number;
  stateAndStep: Readonly<
    | { state: "findTarget"; step: FindStoreWithSpaceStep }
    | { state: "deliverToTarget"; step: TravelOnPathStep }
    | { state: "returnBack"; step: TravelOnPathStep }
    | { state: "done"; step: null }
  >;

  static makePerson(
    people: People,
    peopleOptions: Omit<GoodsDelivererPersonOptions, "mission">,
    missionOptions: DeliverToAcceptingStoreMissionOptions,
  ): GoodsDelivererPerson {
    return super.makePerson(people, peopleOptions, missionOptions);
  }

  constructor(
    game: Game,
    person: GoodsDelivererPerson,
    options: DeliverToAcceptingStoreMissionOptions,
  ) {
    super(game, person, options);
    this.goodType = person.goodType;
    this.goodAmount = person.goodAmount;
    this.stateAndStep = this.findTarget();
  }

  tick(_tickCount: number): boolean {
    const { state, step } = this.stateAndStep;
    switch (state) {
      case "findTarget": {
        const { done, result } = step.tick(_tickCount);
        if (!done) {
          break;
        }
        const { building, path } = result;
        this.stateAndStep = this.deliverToTarget(building, path);
        break;
      }
      case "deliverToTarget": {
        const { done, success } = step.tick(_tickCount);
        if (!done) {
          break;
        }
        if (!success) {
          this.stateAndStep = this.findTarget();
          break;
        }

        if (
          !ContentStoreUtils.store(
            step.targetBuilding!,
            this.goodType,
            this.goodAmount,
            true,
          )
        ) {
          this.stateAndStep = this.findTarget();
          break;
        }
        this.person.goodAmount = 0;
        this.stateAndStep = this.returnBackOrDone();
        break;
      }
      case "returnBack": {
        const { done } = step.tick(_tickCount);
        if (!done) {
          break;
        }
        this.stateAndStep = this.done();
        break;
      }
      case "done":
        break;
      default:
        throw unreachableCase(state, `Unknwon state "${state}"`);
    }
    return this.stateAndStep.state === "done";
  }

  findTarget(): this["stateAndStep"] {
    return {
      state: "findTarget",
      step: new FindStoreWithSpaceStep(
        this.game,
        this.person,
        this.goodType,
        this.goodAmount,
      ),
    };
  }

  deliverToTarget(building: Building, path: Cell[]): this["stateAndStep"] {
    return {
      state: "deliverToTarget",
      step: new TravelOnPathStep(this.game, this.person, building, path),
    };
  }

  returnBack(path: Cell[]): this["stateAndStep"] {
    return {
      state: "returnBack",
      step: new TravelOnPathStep(
        this.game,
        this.person,
        this.sourceBuilding,
        path,
      ),
    };
  }

  returnBackOrDone(): this["stateAndStep"] {
    const path = this.sourceBuilding!.getPathFrom(this.person.cell);
    if (!path || path.length) {
      return this.done();
    }
    return this.returnBack(path);
  }
}
