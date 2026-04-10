import {
  immutable,
  Immutable,
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

  constructor(buildings: Buildings, { position }: HouseOptions) {
    this.buildings = buildings;
    this.id = this.buildings.createId();
    this.type = "house";
    this.position = position;
    this.mutationHelper = new MutationHelper<
      HouseBuilding,
      HouseBuildingImmutable
    >(this);
    this.buildings.add(this);
    new ImmigrantPerson(this.buildings.game.people, {
      targetBuildingId: this.id,
    });
  }
}
