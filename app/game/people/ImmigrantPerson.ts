import {
  immutable,
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
  parentSecondaryKey,
} from "~/immutable";
import type { People } from "./People";
import { getDistance } from "../Coords";
import type { HouseBuilding } from "../buildings";

export type ImmigrantPersonImmutable = Pick<
  ImmigrantPerson,
  "id" | "type" | "targetBuildingId" | "completionRate" | "completion"
> &
  Immutable<ImmigrantPerson>;

export class ImmigrantPerson implements Mutable<
  ImmigrantPerson,
  ImmigrantPersonImmutable
> {
  mutationHelper: MutationHelper<ImmigrantPerson, ImmigrantPersonImmutable>;
  @parentKey("byId")
  people: People;
  @immutable
  @parentSecondaryKey
  id: number;
  @immutable
  type: "immigrant";
  @immutable
  targetBuildingId: number;
  @immutable
  completionRate: number;
  @mutable("plainValue")
  completion: number;

  constructor(
    people: People,
    { targetBuildingId }: Pick<ImmigrantPerson, "targetBuildingId">,
  ) {
    this.people = people;
    this.id = this.people.createId();
    this.type = "immigrant";
    this.targetBuildingId = targetBuildingId;
    this.completionRate =
      1 /
      getDistance(
        { x: 0, y: 0 },
        this.people.game.buildings.byId[this.targetBuildingId].position,
      );
    this.completion = 0;
    this.mutationHelper = new MutationHelper<
      ImmigrantPerson,
      ImmigrantPersonImmutable
    >(this);
    this.people.add(this);
  }

  get targetBuilding(): HouseBuilding | null {
    return (
      (this.people.game.buildings.byId[
        this.targetBuildingId
      ] as HouseBuilding) ?? null
    );
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
    this.people.remove(this);
    this.targetBuilding?.immigrantRemoved(this);
  }
}
