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

  constructor(game: Game) {
    this.game = game;
    this.nextId = 1;
    this.byId = {};
    this.mutationHelper = new MutationHelper<Buildings, BuildingsImmutable>(
      this,
    );
  }

  createId(): number {
    const id = this.nextId;
    this.nextId++;
    return id;
  }

  add(building: Building): Building {
    this.byId[building.id] = building;
    this.mutationHelper.markDirty("nextId", ["byId", building.id]);
    return building;
  }
}
