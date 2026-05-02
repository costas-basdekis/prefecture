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
import _ from "lodash";

export type BuildingWithContents<G extends Good> = {
  contentStore: ContentStore<G>;
};

export type ContentStoreOptions<G extends Good> = {
  acceptableGoods: readonly G[];
  acceptsExternalDeliveries: boolean;
  allowsExternalPickups: boolean;
  capacity: number;
};

export type ContentStoreImmutable<G extends Good> = Pick<
  ContentStore<G>,
  | "acceptableGoods"
  | "acceptsExternalDeliveries"
  | "capacity"
  | "contents"
  | "emptySpace"
> &
  Immutable<ContentStore<G>>;

export class ContentStore<G extends Good> implements Mutable<
  ContentStoreImmutable<G>
> {
  mutationHelper: MutationHelper<ContentStore<G>, ContentStoreImmutable<G>>;
  @parentKey("contentStore")
  building: Building & BuildingWithContents<G>;
  @immutable
  acceptableGoods: readonly G[];
  @immutable
  acceptsExternalDeliveries: boolean;
  @immutable
  allowsExternalPickups: boolean;
  @immutable
  capacity: number;
  @mutable("plainValueMap")
  contents: Partial<Record<G, number>>;
  @mutable("plainValue")
  emptySpace: number;

  constructor(
    building: Building & BuildingWithContents<G>,
    {
      acceptableGoods,
      acceptsExternalDeliveries,
      allowsExternalPickups,
      capacity,
    }: ContentStoreOptions<G>,
  ) {
    this.building = building;
    this.acceptableGoods = acceptableGoods;
    this.capacity = capacity;
    this.contents = {};
    this.emptySpace = capacity;
    this.acceptsExternalDeliveries = acceptsExternalDeliveries;
    this.allowsExternalPickups = allowsExternalPickups;
    this.mutationHelper = new MutationHelper<
      ContentStore<G>,
      ContentStoreImmutable<G>
    >(this);
  }

  hasRoomFor(good: Good, amount: number, externalDelivery: boolean): boolean {
    if (this.emptySpace < amount) {
      return false;
    }
    if (externalDelivery && !this.acceptableGoods.includes(good as any)) {
      return false;
    }
    return true;
  }

  hasAmount(good: Good, maxAmount: number, externalPickup: boolean): number {
    if (externalPickup && !this.allowsExternalPickups) {
      return 0;
    }
    return Math.min(maxAmount, this.contents[good as G] ?? 0);
  }

  isEmpty(): boolean {
    return _.every(
      Object.values(this.contents),
      (amount: number) => amount === 0,
    );
  }

  store(good: Good, amount: number, externalDelivery: boolean): boolean {
    if (!this.hasRoomFor(good, amount, externalDelivery)) {
      return false;
    }
    const acceptableGood = good as G;
    this.contents[acceptableGood] =
      (this.contents[acceptableGood] ?? 0) + amount;
    this.emptySpace -= amount;
    return true;
  }

  take(good: Good, maxAmount: number, externalPickup: boolean): number {
    const amount = this.hasAmount(good, maxAmount, externalPickup);
    if (!amount) {
      return amount;
    }
    this.contents[good as G]! -= amount;
    return amount;
  }
}

export const ContentStoreUtils = {
  hasRoomFor(
    building: Building,
    good: Good,
    amount: number,
    externalDelivery: boolean,
  ): boolean {
    return (
      "contentStore" in building &&
      building.contentStore instanceof ContentStore &&
      building.contentStore.hasRoomFor(good, amount, externalDelivery)
    );
  },
  hasAmount(
    building: Building,
    good: Good,
    maxAmount: number,
    externalPickup: boolean,
  ): number {
    return "contentStore" in building &&
      building.contentStore instanceof ContentStore
      ? building.contentStore.hasAmount(good, maxAmount, externalPickup)
      : 0;
  },
  store(
    building: Building,
    good: Good,
    amount: number,
    externalDelivery: boolean,
  ): boolean {
    return (
      "contentStore" in building &&
      building.contentStore instanceof ContentStore &&
      building.contentStore.store(good, amount, externalDelivery)
    );
  },
  take(
    building: Building,
    good: Good,
    maxAmount: number,
    externalPickup: boolean,
  ): number {
    return "contentStore" in building &&
      building.contentStore instanceof ContentStore
      ? building.contentStore.take(good, maxAmount, externalPickup)
      : 0;
  },
};
