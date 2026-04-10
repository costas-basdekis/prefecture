import {
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import type { Game } from "../Game";
import { Person, PersonImmutable } from "./Person";

export type PeopleImmutable = Pick<People, "nextId"> & {
  byId: Record<number, PersonImmutable>;
  getPeople: () => PersonImmutable[];
} & Immutable<People>;

export class People implements Mutable<People, PeopleImmutable> {
  mutationHelper: MutationHelper<People, PeopleImmutable>;
  @parentKey("people")
  game: Game;
  @mutable("plainValue")
  nextId: number;
  @mutable("mappedMutable")
  byId: Record<number, Person>;

  constructor(game: Game) {
    this.game = game;
    this.nextId = 1;
    this.byId = {};
    this.mutationHelper = new MutationHelper<People, PeopleImmutable>(this, {
      getPeople: function (this: PeopleImmutable): PersonImmutable[] {
        return Object.values(this.byId);
      },
    });
  }

  createId(): number {
    const id = this.nextId;
    this.nextId++;
    return id;
  }

  add(person: Person): Person {
    this.byId[person.id] = person;
    this.mutationHelper.markDirty("nextId", ["byId", person.id]);
    return person;
  }
}
