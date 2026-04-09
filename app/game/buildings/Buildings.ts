import { Immutable, Mutable, MutationHelper } from "~/immutable";
import { Game } from "../Game";
import { Building, BuildingImmutable } from "./Building";

export type BuildingsImmutable = Pick<Buildings, "nextId"> & {
  byId: BuildingMapImmutable;
} & Immutable<Buildings>;

export class BuildingsMutationHelper extends MutationHelper<
  Buildings,
  BuildingsImmutable,
  { nextId: boolean; byId: Set<number> },
  "nextId" | number
> {
  getInitialDirtyKeys() {
    return { nextId: false, byId: new Set<number>() };
  }

  getInitialLastImmutable() {
    return {
      _mutable: this.mutable,
      nextId: this.mutable.nextId,
      byId: Object.fromEntries(
        Object.values(this.mutable.byId).map(
          (building) => [building.id, building.getImmutable()] as const,
        ),
      ),
    };
  }

  markDirty(...keys: ("nextId" | number)[]): void {
    super.markDirty(...keys);
    this.mutable.game.mutationHelper.markDirty("buildings");
  }

  markKeyDirty(key: number | "nextId") {
    if (typeof key === "string") {
      super.markKeyDirty(key);
      return;
    }
    this.dirtyKeys.byId.add(key);
  }

  updateImmutableDirtyKeys() {
    this.updateForPlainValue("nextId");
    this.updateForMappedMutable("byId");
  }
}

type BuildingMap = Record<number, Building>;
type BuildingMapImmutable = Record<number, BuildingImmutable>;

export class Buildings implements Mutable<Buildings, BuildingsImmutable> {
  mutationHelper: BuildingsMutationHelper;
  game: Game;
  nextId: number;
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
    this.mutationHelper.markDirty("nextId", building.id);
    return building;
  }
}
