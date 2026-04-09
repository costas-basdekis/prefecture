import { MutationHelper } from "~/immutable";
import { Game } from "../Game";
import { Building, BuildingImmutable } from "./Building";

export type BuildingsImmutable = Pick<Buildings, "nextId"> & {
  byId: BuildingMapImmutable;
};

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
      nextId: this.mutable.nextId,
      byId: this.mutable.byId,
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
    if (this.dirtyKeys.nextId) {
      this.lastImmutable.nextId = this.mutable.nextId;
      this.dirtyKeys.nextId = false;
    }
    if (this.dirtyKeys.byId.size) {
      this.lastImmutable.byId = { ...this.mutable.byId };
      for (const id of this.dirtyKeys.byId) {
        this.lastImmutable.byId[id] = this.mutable.byId[id].getImmutable();
      }
      this.dirtyKeys.byId.clear();
    }
  }
}

type BuildingMap = Record<number, Building>;
type BuildingMapImmutable = Record<number, BuildingImmutable>;

export class Buildings {
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
