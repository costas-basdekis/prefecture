import {
  immutable,
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import { People } from "./People";

export type ImmigrantPersonImmutable = Pick<
  ImmigrantPerson,
  "id" | "targetBuildingId" | "completion"
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
  id: number;
  @immutable
  targetBuildingId: number;
  @mutable("plainValue")
  completion: number;

  constructor(
    people: People,
    { targetBuildingId }: Pick<ImmigrantPerson, "targetBuildingId">,
  ) {
    this.people = people;
    this.id = this.people.createId();
    this.targetBuildingId = targetBuildingId;
    this.completion = 0;
    this.mutationHelper = new MutationHelper<
      ImmigrantPerson,
      ImmigrantPersonImmutable
    >(this);
    this.people.add(this);
  }
}
