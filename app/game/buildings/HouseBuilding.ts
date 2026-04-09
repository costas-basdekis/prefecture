import { Immutable, Mutable, MutationHelper } from "~/immutable";
import { Buildings } from "./Buildings";

export type HouseBuildingImmutable = {
  id: number;
  type: "house";
} & Immutable<HouseBuilding>;

export class HouseBuildingMutationHelper extends MutationHelper<
  HouseBuilding,
  HouseBuildingImmutable,
  {}
> {
  getInitialDirtyKeys() {
    return {};
  }

  getInitialLastImmutable() {
    return {
      _mutable: this.mutable,
      id: this.mutable.id,
      type: this.mutable.type,
    };
  }

  markDirty(): void {
    super.markDirty();
    this.mutable.buildings.mutationHelper.markDirty(this.mutable.id);
  }
}

export class HouseBuilding implements Mutable<
  HouseBuilding,
  HouseBuildingImmutable
> {
  mutationHelper: HouseBuildingMutationHelper;
  id: number;
  type: "house";
  buildings: Buildings;

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
