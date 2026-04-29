import { Mutable, Immutable, mutable, immutable } from "~/immutable";
import { Cell } from "../Cell";
import {
  BasePerson,
  BasePersonImmutable,
  BasePersonOptions,
} from "./BasePerson";
import type { People } from "./People";

export type BaseGridPersonOptions = Pick<
  BaseGridPerson<any, any, any>,
  "cell"
> &
  BasePersonOptions;

export type BaseGridPersonImmutable<P extends BaseGridPerson<any, any, any>> =
  Pick<P, "positionKey" | "speed"> & BasePersonImmutable<P>;

export abstract class BaseGridPerson<
  M extends Mutable<M, I>,
  I extends Immutable<M>,
  T extends string,
> extends BasePerson<M, I, T> {
  @mutable("plainValueById", "key", "positionKey")
  cell: Cell;
  declare positionKey: string;
  @immutable
  speed: number;

  constructor(
    people: People,
    type: T,
    speed: number,
    { cell }: BaseGridPersonOptions,
  ) {
    super(people, type);
    this.cell = cell;
    this.speed = speed;
  }
}
