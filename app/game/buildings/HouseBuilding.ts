import {
  immutable,
  Immutable,
  Mutable,
  MutationHelper,
  parent,
} from "~/immutable";
import { Buildings } from "./Buildings";

export type HouseBuildingImmutable = {
  id: number;
  type: "house";
} & Immutable<HouseBuilding>;

export class HouseBuildingMutationHelper extends MutationHelper<
  HouseBuilding,
  HouseBuildingImmutable,
  {}
> {}

export class HouseBuilding implements Mutable<
  HouseBuilding,
  HouseBuildingImmutable
> {
  mutationHelper: HouseBuildingMutationHelper;
  @parent("byId")
  buildings: Buildings;
  @immutable
  id: number;
  @immutable
  type: "house";

  constructor() {
    this.id = 0;
    this.type = "house";
    this.buildings = null!;
    this.mutationHelper = new HouseBuildingMutationHelper(this);
  }

  getImmutable(): HouseBuildingImmutable {
    return this.mutationHelper.getImmutable();
  }
}
