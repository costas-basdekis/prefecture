import {
  immutable,
  Immutable,
  Mutable,
  MutationHelper,
  parentKey,
  parentSecondaryKey,
} from "~/immutable";
import type { People } from "./People";
import { EventsManager } from "../events";
import { Person } from "./Person";

export type BasePersonOptions = {};

export type BasePersonImmutable<P extends BasePerson<any, any>> = Pick<
  P,
  "id" | "type"
> &
  Immutable<P>;

export abstract class BasePerson<
  I extends Immutable<BasePerson<I, T>>,
  T extends string,
> implements Mutable<I> {
  mutationHelper: MutationHelper<BasePerson<I, T>, I>;
  @parentKey("byId")
  people: People;
  @immutable
  @parentSecondaryKey
  id: number;
  @immutable
  type: T;

  eventsManager = new EventsManager();
  onRemoved = this.eventsManager.add<(person: Person) => void>();

  constructor(people: People, type: T) {
    this.people = people;
    this.id = this.people.createId();
    this.type = type;
    this.mutationHelper = null!;
  }

  postInit() {
    this.mutationHelper = new MutationHelper<BasePerson<I, T>, I>(this);
    this.people.add(this as any);
  }

  remove() {
    this.onRemoved.trigger(this as any);
    this.people.remove(this as any);
    this.onRemoved.clear();
  }

  tick?(tickCount: number): void;
}
