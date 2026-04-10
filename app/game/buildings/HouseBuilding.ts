import {
  immutable,
  Immutable,
  Mutable,
  MutationHelper,
  parentKey,
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
  @parentKey("byId")
  buildings: Buildings;
  @immutable
  @parentSecondaryKey
  id: number;
  @immutable
  type: "house";

  constructor(buildings: Buildings) {
    this.buildings = buildings;
    this.id = this.buildings.createId();
    this.type = "house";
    this.mutationHelper = new MutationHelper<
      HouseBuilding,
      HouseBuildingImmutable
    >(this);
    this.buildings.add(this);
  }
}
