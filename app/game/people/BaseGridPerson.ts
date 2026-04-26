import { Mutable, Immutable, mutable, immutable } from "~/immutable";
import { propById } from "~/utils";
import { Cell } from "../Cell";
import {
  BasePerson,
  BasePersonImmutable,
  BasePersonOptions,
} from "./BasePerson";
import type { People } from "./People";

export type BaseGridPersonOptions = Pick<
  BaseGridPerson<any, any, any>,
  "positionKey"
> &
  BasePersonOptions;

export type BaseGridPersonImmutable<P extends BaseGridPerson<any, any, any>> =
  Pick<P, "positionKey" | "speed"> & BasePersonImmutable<P>;

export abstract class BaseGridPerson<
  M extends Mutable<M, I>,
  I extends Immutable<M>,
  T extends string,
> extends BasePerson<M, I, T> {
  @mutable("plainValue")
  positionKey: string;
  @propById(
    "positionKey",
    (key: string, thisObject: BaseGridPerson<M, I, T>) =>
      thisObject.people.game.grid.cellMap[key],
    { thisIdKey: "key" },
  )
  declare cell: Cell;
  @immutable
  speed: number;

  constructor(
    people: People,
    type: T,
    speed: number,
    { positionKey }: BaseGridPersonOptions,
  ) {
    super(people, type);
    this.positionKey = positionKey;
    this.speed = speed;
  }
}
