import { ImmigrantPerson, ImmigrantPersonImmutable } from "./ImmigrantPerson";
import {
  WorkerFinderPerson,
  WorkerFinderPersonImmutable,
} from "./WorkerFinderPerson";

export type Person = ImmigrantPerson | WorkerFinderPerson;
export type PersonImmutable =
  | ImmigrantPersonImmutable
  | WorkerFinderPersonImmutable;
