import { immutable, Immutable, mutable } from "~/immutable";
import type { People } from "./People";
import { getDistance } from "../Coords";
import type { HouseBuilding } from "../buildings";
import { propById } from "~/utils";
import { BasePerson } from "./BasePerson";

declare module "./Person" {
  interface PersonDefinitions {
    immigrant: ImmigrantPerson;
  }
  interface PersonImmutableDefinitions {
    immigrant: ImmigrantPersonImmutable;
  }
}

export type ImmigrantPersonOptions = Pick<ImmigrantPerson, "targetBuildingId">;

export type ImmigrantPersonImmutable = Pick<
  ImmigrantPerson,
  "id" | "type" | "targetBuildingId" | "completionRate" | "completion"
> &
  Immutable<ImmigrantPerson>;

export class ImmigrantPerson extends BasePerson<
  ImmigrantPerson,
  ImmigrantPersonImmutable,
  "immigrant"
> {
  @immutable
  targetBuildingId: number;
  @propById(
    "targetBuildingId",
    (id: number, thisObject: ImmigrantPerson) =>
      thisObject.people.game.buildings.byId[id],
    false,
  )
  declare targetBuilding: HouseBuilding;
  @immutable
  completionRate: number;
  @mutable("plainValue")
  completion: number;

  constructor(people: People, { targetBuildingId }: ImmigrantPersonOptions) {
    super(people, "immigrant");
    this.targetBuildingId = targetBuildingId;
    this.completionRate =
      1 /
      getDistance(
        { x: 0, y: 0 },
        this.people.game.buildings.byId[this.targetBuildingId].positions[0],
      );
    this.completion = 0;
    this.postInit();
  }

  tick() {
    if (this.completion >= 1) {
      (
        this.people.game.buildings.byId[this.targetBuildingId] as HouseBuilding
      ).immigrantArrived(this);
      this.people.remove(this);
      return;
    }
    this.completion = Math.min(1, this.completion + this.completionRate);
  }

  remove() {
    super.remove();
    this.targetBuilding?.immigrantRemoved(this);
  }
}
