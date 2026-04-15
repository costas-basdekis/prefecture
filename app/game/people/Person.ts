import {
  GoodsDelivererPerson,
  GoodsDelivererPersonImmutable,
} from "./GoodsDelivererPerson";
import { ImmigrantPerson, ImmigrantPersonImmutable } from "./ImmigrantPerson";
import {
  WorkerFinderPerson,
  WorkerFinderPersonImmutable,
} from "./WorkerFinderPerson";

export type Person =
  | ImmigrantPerson
  | WorkerFinderPerson
  | GoodsDelivererPerson;
export type PersonImmutable =
  | ImmigrantPersonImmutable
  | WorkerFinderPersonImmutable
  | GoodsDelivererPersonImmutable;
