import { Immutable, Mutable, mutate, MutationHelper } from "~/immutable";
import { Game } from "../Game";
import { Building, BuildingImmutable } from "./Building";

export type BuildingsImmutable = Pick<Buildings, "nextId"> & {
  byId: BuildingMapImmutable;
} & Immutable<Buildings>;

export class BuildingsMutationHelper extends MutationHelper<
  Buildings,
  BuildingsImmutable,
  { nextId: boolean; byId: Set<number> },
  "nextId" | ["byId", number]
> {
  parentKey = "game" as const;
  parentDirtyKey = "buildings";
}

type BuildingMap = Record<number, Building>;
type BuildingMapImmutable = Record<number, BuildingImmutable>;

export class Buildings implements Mutable<Buildings, BuildingsImmutable> {
  mutationHelper: BuildingsMutationHelper;
  game: Game;
  @mutate("plainValue")
  nextId: number;
  @mutate("mappedMutable")
  byId: BuildingMap;

  static make(): Buildings {
    return new this(null, 1, {});
  }

  constructor(game: Game | null, nextId: number, byId: BuildingMap) {
    this.game = game!;
    this.nextId = nextId;
    this.byId = byId;
    this.mutationHelper = new BuildingsMutationHelper(this);
  }

  getImmutable(): BuildingsImmutable {
    return this.mutationHelper.getImmutable();
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
