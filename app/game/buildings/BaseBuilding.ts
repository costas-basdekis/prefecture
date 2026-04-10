import {
  immutable,
  Immutable,
  Mutable,
  MutationHelper,
  parentKey,
  parentSecondaryKey,
} from "~/immutable";
import type { Buildings } from "./Buildings";
import type { Coords } from "../Coords";

export type BaseBuildingOptions = Pick<BaseBuilding<any, any, any>, "position">;

export type BaseBuildingImmutable<B extends BaseBuilding<any, any, any>> = Pick<
  B,
  "id" | "type" | "position"
> &
  Immutable<B>;

export abstract class BaseBuilding<
  M extends Mutable<M, I>,
  I extends Immutable<M>,
  T extends string,
> implements Mutable<M, I> {
  mutationHelper: MutationHelper<M, I>;
  @parentKey("byId")
  buildings: Buildings;
  @immutable
  @parentSecondaryKey
  id: number;
  @immutable
  type: T;
  @immutable
  position: Coords;

  constructor(
    buildings: Buildings,
    type: T,
    { position }: BaseBuildingOptions,
  ) {
    this.buildings = buildings;
    this.id = this.buildings.createId();
    this.type = type;
    this.position = position;
    this.mutationHelper = new MutationHelper<M, I>(this as unknown as M);
    this.buildings.add(this as any);
  }
}
