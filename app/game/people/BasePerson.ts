import {
  immutable,
  Immutable,
  Mutable,
  MutationHelper,
  parentKey,
  parentSecondaryKey,
} from "~/immutable";
import type { People } from "./People";

export type BasePersonImmutable<P extends BasePerson<any, any, any>> = Pick<
  P,
  "id" | "type"
> &
  Immutable<P>;

export class BasePerson<
  M extends Mutable<M, I>,
  I extends Immutable<M>,
  T extends string,
> implements Mutable<M, I> {
  mutationHelper: MutationHelper<M, I>;
  @parentKey("byId")
  people: People;
  @immutable
  @parentSecondaryKey
  id: number;
  @immutable
  type: T;

  constructor(people: People, type: T) {
    this.people = people;
    this.id = this.people.createId();
    this.type = type;
    this.mutationHelper = null!;
  }

  postInit() {
    this.mutationHelper = new MutationHelper<M, I>(this as unknown as M);
    this.people.add(this as any);
  }

  remove() {
    this.people.remove(this as any);
  }

  tick?(tickCount: number): void;
}
