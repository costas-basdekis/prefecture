import { propById } from "~/utils";
import type { Building } from "../../buildings";
import { Game } from "../../Game";
import {
  GoodsDelivererPerson,
  GoodsDelivererPersonOptions,
} from "../GoodsDelivererPerson";
import { BasePersonMission } from "./BasePersonMission";
import type { People } from "../People";

export type BaseGoodsDelivererMissionOptions = {
  sourceBuildingId: number;
};

export abstract class BaseGoodsDelivererMission extends BasePersonMission<GoodsDelivererPerson> {
  readonly sourceBuildingId: number;
  @propById(
    "sourceBuildingId",
    (id: number, thisObject: BaseGoodsDelivererMission) =>
      thisObject.game.buildings.byId[id],
    { allowSetter: false },
  )
  declare readonly sourceBuilding: Building | null;

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
    { sourceBuildingId }: BaseGoodsDelivererMissionOptions,
  ) {
    super(game, person);
    this.sourceBuildingId = sourceBuildingId;
  }
}
