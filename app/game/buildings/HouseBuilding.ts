import {
  immutable,
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
  parentSecondaryKey,
} from "~/immutable";
import type { Buildings } from "./Buildings";
import { ImmigrantPerson } from "../people";
import type { Coords } from "../Coords";

export type HouseBuildingImmutable = Pick<
  HouseBuilding,
  "id" | "type" | "position"
> &
  Immutable<HouseBuilding>;

export type HouseOptions = {
  position: Coords;
};

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
  @immutable
  position: Coords;
  @mutable("plainValue")
  level: number;
  @mutable("plainValue")
  occupantCount: number;
  @mutable("plainValue")
  maxOccupantCount: number;

  static maxOccupantCountMap: number[] = [
    0, 3, 7, 12, 18, 25, 33, 42, 52, 63, 75,
  ];

  constructor(buildings: Buildings, { position }: HouseOptions) {
    this.buildings = buildings;
    this.id = this.buildings.createId();
    this.type = "house";
    this.position = position;
    this.level = 1;
    this.occupantCount = 0;
    this.maxOccupantCount = HouseBuilding.maxOccupantCountMap[this.level];
    this.mutationHelper = new MutationHelper<
      HouseBuilding,
      HouseBuildingImmutable
    >(this);
    this.buildings.add(this);
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
