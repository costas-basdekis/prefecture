import { immutable, mutable } from "~/immutable";
import type { People } from "./People";
import { getDistance } from "../Coords";
import type { HouseBuilding } from "../buildings";
import { BasePerson, BasePersonImmutable } from "./BasePerson";

declare module "./Person" {
  interface PersonDefinitions {
    immigrant: ImmigrantPerson;
  }
  interface PersonImmutableDefinitions {
    immigrant: ImmigrantPersonImmutable;
  }
}

export type ImmigrantPersonOptions = Pick<ImmigrantPerson, "targetBuilding">;

export type ImmigrantPersonImmutable = Pick<
  ImmigrantPerson,
  "id" | "type" | "targetBuildingId" | "completionRate" | "completion"
> &
  BasePersonImmutable<ImmigrantPerson>;

export class ImmigrantPerson extends BasePerson<
  ImmigrantPersonImmutable,
  "immigrant"
> {
  @immutable
  targetBuilding: HouseBuilding;
  @immutable
  targetBuildingId: number;
  @immutable
  completionRate: number;
  @mutable("plainValue")
  completion: number;

  onArrived = this.eventsManager.add<(person: ImmigrantPerson) => void>();

  constructor(people: People, { targetBuilding }: ImmigrantPersonOptions) {
    super(people, "immigrant");
    this.targetBuilding = targetBuilding;
    this.targetBuildingId = targetBuilding.id;
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
      this.onArrived.trigger(this);
      this.people.remove(this);
      return;
    }
    this.completion = Math.min(1, this.completion + this.completionRate);
  }
}
