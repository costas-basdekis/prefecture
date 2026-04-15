import {
  immutable,
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import { Building } from "./Building";
import { Good } from "../goods";

export type BuildingWithContents<G extends Good> = {
  contentStore: ContentStore<G>;
};

export type ContentStoreImmutable<G extends Good> = Pick<
  ContentStore<G>,
  "acceptableGoods" | "capacity" | "contents" | "emptySpace"
> &
  Immutable<ContentStore<G>>;

export class ContentStore<G extends Good> implements Mutable<
  ContentStore<G>,
  ContentStoreImmutable<G>
> {
  mutationHelper: MutationHelper<ContentStore<G>, ContentStoreImmutable<G>>;
  @parentKey("contentStore")
  building: Building & BuildingWithContents<G>;
  @immutable
  acceptableGoods: readonly G[];
  @immutable
  capacity: number;
  @mutable("plainValueMap")
  contents: Partial<Record<G, number>>;
  @mutable("plainValue")
  emptySpace: number;

  constructor(
    building: Building & BuildingWithContents<G>,
    acceptableGoods: readonly G[],
    capacity: number,
  ) {
    this.building = building;
    this.acceptableGoods = acceptableGoods;
    this.capacity = capacity;
    this.contents = {};
    this.emptySpace = capacity;
    this.mutationHelper = new MutationHelper<
      ContentStore<G>,
      ContentStoreImmutable<G>
    >(this);
  }

  hasRoomFor(good: Good, amount: number): boolean {
    if (this.emptySpace < amount) {
      return false;
    }
    if (!this.acceptableGoods.includes(good as any)) {
      return false;
    }
    return true;
  }

  store(good: Good, amount: number): boolean {
    if (!this.hasRoomFor(good, amount)) {
      return false;
    }
    const acceptableGood = good as G;
    this.contents[acceptableGood] =
      (this.contents[acceptableGood] ?? 0) + amount;
    this.emptySpace -= amount;
    return true;
  }
}

export const ContentStoreUtils = {
  hasRoomFor(building: Building, good: Good, amount: number): boolean {
    return (
      "contentStore" in building &&
      building.contentStore instanceof ContentStore &&
      building.contentStore.hasRoomFor(good, amount)
    );
  },
  store(building: Building, good: Good, amount: number): boolean {
    return (
      "contentStore" in building &&
      building.contentStore instanceof ContentStore &&
      building.contentStore.store(good, amount)
    );
  },
};
