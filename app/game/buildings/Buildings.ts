import {
  Immutable,
  Mutable,
  mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import type { Game } from "../Game";
import { Building, BuildingImmutable } from "./Building";

export type BuildingsImmutable = Pick<Buildings, "nextId"> & {
  byId: BuildingMapImmutable;
} & Immutable<Buildings>;

type BuildingMap = Record<number, Building>;
type BuildingMapImmutable = Record<number, BuildingImmutable>;

export class Buildings implements Mutable<Buildings, BuildingsImmutable> {
  mutationHelper: MutationHelper<Buildings, BuildingsImmutable>;
  @parentKey("buildings")
  game: Game;
  @mutable("plainValue")
  nextId: number;
  @mutable("mappedMutable")
  byId: BuildingMap;

  static make(): Buildings {
    return new this(null, 1, {});
  }

  constructor(game: Game | null, nextId: number, byId: BuildingMap) {
    this.game = game!;
    this.nextId = nextId;
    this.byId = byId;
    this.mutationHelper = new MutationHelper<Buildings, BuildingsImmutable>(
      this,
    );
  }

  add(building: Building): Building {
    building.id = this.nextId;
    building.buildings = this;
    this.nextId++;
    this.byId[building.id] = building;
    this.mutationHelper.markDirty("nextId", ["byId", building.id]);
    return building;
  }
}
