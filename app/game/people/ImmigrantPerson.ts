import {
  immutable,
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
  parentSecondaryKey,
} from "~/immutable";
import { People } from "./People";
import { getDistance } from "../Coords";

export type ImmigrantPersonImmutable = Pick<
  ImmigrantPerson,
  "id" | "targetBuildingId" | "completionRate" | "completion"
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

  tick() {
    if (this.completion >= 1) {
      this.people.game.buildings.byId[this.targetBuildingId].immigrantArrived(
        this,
      );
      this.people.remove(this);
      return;
    }
    this.completion = Math.min(1, this.completion + this.completionRate);
    this.mutationHelper.markDirty("completion");
  }
}
