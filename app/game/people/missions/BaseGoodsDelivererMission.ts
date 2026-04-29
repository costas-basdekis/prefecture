import type { Building } from "../../buildings";
import { Game } from "../../Game";
import {
  GoodsDelivererPerson,
  GoodsDelivererPersonOptions,
} from "../GoodsDelivererPerson";
import { BasePersonMission } from "./BasePersonMission";
import type { People } from "../People";

export type BaseGoodsDelivererMissionOptions = {
  sourceBuilding: Building;
};

export abstract class BaseGoodsDelivererMission extends BasePersonMission<GoodsDelivererPerson> {
  readonly sourceBuilding: Building;

  static makePerson(
    people: People,
    peopleOptions: Omit<GoodsDelivererPersonOptions, "mission">,
    missionOptions: any,
  ): GoodsDelivererPerson {
    const person = new GoodsDelivererPerson(people, {
      ...peopleOptions,
      mission: null!,
    });
    // @ts-ignore
    person.mission = new this(people.game, person, missionOptions);
    return person;
  }

  constructor(
    game: Game,
    person: GoodsDelivererPerson,
    { sourceBuilding }: BaseGoodsDelivererMissionOptions,
  ) {
    super(game, person);
    this.sourceBuilding = sourceBuilding;
  }
}
