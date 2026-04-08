import { Building } from "./Building";

type BuildingMap = Record<number, Building>;

export class Buildings {
  nextId: number;
  byId: BuildingMap;

  static make(): Buildings {
    return new this(1, {});
  }

  constructor(nextId: number, byId: BuildingMap) {
    this.nextId = nextId;
    this.byId = byId;
  }

  add(building: Building): Buildings {
    building.id = this.nextId;
    return new Buildings(this.nextId + 1, {
      ...this.byId,
      [building.id]: building,
    });
  }
}
