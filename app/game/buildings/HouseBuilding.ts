import { mutable } from "~/immutable";
import type { Buildings } from "./Buildings";
import { ImmigrantPerson } from "../people";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";

export type HouseOptions = BaseBuildingOptions;

export type HouseBuildingImmutable = BaseBuildingImmutable<HouseBuilding>;

export class HouseBuilding extends BaseBuilding<
  HouseBuilding,
  HouseBuildingImmutable,
  "house"
> {
  @mutable("plainValue")
  level: number;
  @mutable("plainValue")
  occupantCount: number;
  @mutable("plainValue")
  maxOccupantCount: number;

  static maxOccupantCountMap: number[] = [
    0, 3, 7, 12, 18, 25, 33, 42, 52, 63, 75,
  ];

  constructor(buildings: Buildings, options: BaseBuildingOptions) {
    super(buildings, "house", options);
    this.level = 1;
    this.occupantCount = 0;
    this.maxOccupantCount = HouseBuilding.maxOccupantCountMap[this.level];
    this.spawnImmigrant();
  }

  spawnImmigrant() {
    new ImmigrantPerson(this.buildings.game.people, {
      targetBuildingId: this.id,
    });
  }

  immigrantArrived(person: ImmigrantPerson) {
    if (this.occupantCount >= this.maxOccupantCount) {
      return;
    }
    this.occupantCount = Math.min(
      this.maxOccupantCount,
      this.occupantCount + 5,
    );
    this.mutationHelper.markDirty("occupantCount");
    if (this.occupantCount < this.maxOccupantCount) {
      this.spawnImmigrant();
    }
  }
}
