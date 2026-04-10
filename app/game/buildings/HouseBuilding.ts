import {
  immutable,
  Immutable,
  Mutable,
  MutationHelper,
  parent,
  parentSecondaryKey,
} from "~/immutable";
import { Buildings } from "./Buildings";

export type HouseBuildingImmutable = {
  id: number;
  type: "house";
} & Immutable<HouseBuilding>;

export class HouseBuilding implements Mutable<
  HouseBuilding,
  HouseBuildingImmutable
> {
  mutationHelper: MutationHelper<HouseBuilding, HouseBuildingImmutable>;
  @parent("byId")
  buildings: Buildings;
  @immutable
  @parentSecondaryKey
  id: number;
  @immutable
  type: "house";

  constructor() {
    this.id = 0;
    this.type = "house";
    this.buildings = null!;
    this.mutationHelper = new MutationHelper<
      HouseBuilding,
      HouseBuildingImmutable
    >(this);
  }
}
