import { mutable } from "~/immutable";
import type { Buildings } from "./Buildings";
import { ImmigrantPerson, Person } from "../people";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import type { Cell } from "../Cell";
import { Building } from "./Building";
import { Good } from "../goods";

declare module "./Building" {
  interface BuildingDefinitions {
    house: HouseBuilding;
  }
  interface BuildingImmutableDefinitions {
    house: HouseBuildingImmutable;
  }
}

export type HouseOptions = BaseBuildingOptions;

export type HouseBuildingImmutable = Pick<
  HouseBuilding,
  "level" | "occupantCount" | "maxOccupantCount" | "immigrantId"
> &
  BaseBuildingImmutable<HouseBuilding>;

export type HouseAccess<T> = {
  temple: T;
};

export class HouseBuilding extends BaseBuilding<
  HouseBuildingImmutable,
  "house"
> {
  @mutable("plainValue")
  level: number;
  @mutable("plainValue")
  occupantCount: number;
  @mutable("plainValue")
  maxOccupantCount: number;
  @mutable("plainValueMap")
  resources: Partial<Record<Good, number>>;
  @mutable("plainValueMap")
  maxResourcesPerOccupant: Partial<Record<Good, number>>;
  @mutable("plainValueById")
  declare immigrant: ImmigrantPerson | null;
  declare readonly immigrantId: number | null;
  @mutable("plainValueMap")
  accessAge: HouseAccess<number>;

  static maxOccupantCountMap: number[] = [
    0, 3, 7, 12, 18, 25, 33, 42, 52, 63, 75,
  ];
  static maxResourcesPerOccupant: Partial<Record<Good, number>> = {
    wheat: 0.1,
  };
  static requirementsByLevel: Partial<{
    waterCoverage: number;
    resources: Good[];
    access: HouseAccess<true>;
  }>[] = [
    {},
    {},
    { waterCoverage: 1 },
    { waterCoverage: 1, resources: ["wheat"] },
    { waterCoverage: 1, resources: ["wheat"], access: { temple: true } },
  ];
  static maxResourcesPerOccupantPerLevel: Partial<Record<Good, number>>[] =
    this.requirementsByLevel.map((level) =>
      Object.fromEntries(
        (level.resources ?? []).map((good) => [
          good,
          this.maxResourcesPerOccupant[good],
        ]),
      ),
    );

  constructor(buildings: Buildings, options: BaseBuildingOptions) {
    super(buildings, "house", options);
    this.level = 0;
    this.occupantCount = 0;
    this.maxOccupantCount = 0;
    this.resources = {};
    this.maxResourcesPerOccupant = {};
    this.immigrant = null;
    this.accessAge = { temple: 0 };
    this.postInit();
  }

  tick(_tickCount: number) {
    this.updateLevel(this.cells[0]);
    this.reduceAccessAge();
  }

  spawnImmigrant() {
    if (this.occupantCount < this.maxOccupantCount) {
      this.immigrant = new ImmigrantPerson(this.buildings.game.people, {
        targetBuilding: this,
      });
      this.immigrant.onRemoved.register(this.immigrantRemoved.bind(this));
      this.immigrant.onArrived.register(this.onImmigrantArrived.bind(this));
    }
  }

  onImmigrantArrived(immigrant: ImmigrantPerson) {
    if (this.immigrant !== immigrant) {
      return;
    }
    this.immigrant = null;
    if (this.occupantCount >= this.maxOccupantCount) {
      return;
    }
    this.occupantCount = Math.min(
      this.maxOccupantCount,
      this.occupantCount + 5,
    );
    this.spawnImmigrant();
  }

  immigrantRemoved(immigrant: Person) {
    if (this.immigrant === immigrant) {
      this.immigrant = null;
      this.spawnImmigrant();
    }
  }

  updateLevel(_cell: Cell) {
    const waterCoverage = Math.max(
      ...this.cells.map((cell) => cell.waterCoverage.level),
    );
    const nextLevel = HouseBuilding.requirementsByLevel.findLastIndex(
      (level) => {
        if (level.waterCoverage) {
          if (waterCoverage < level.waterCoverage) {
            return false;
          }
        }
        if (level.resources) {
          if (
            level.resources.some((good) => (this.resources[good] ?? 0) === 0)
          ) {
            return false;
          }
        }
        if (level.access) {
          if (level.access.temple && !this.accessAge.temple) {
            return false;
          }
        }
        return true;
      },
    );
    if (nextLevel < 1) {
      return;
    }
    if (nextLevel === this.level) {
      return;
    }
    this.maxOccupantCount = HouseBuilding.maxOccupantCountMap[nextLevel];
    if (this.occupantCount > this.maxOccupantCount) {
      // TODO: Create emigrant
      this.occupantCount = this.maxOccupantCount;
      this.immigrant?.remove();
    } else {
      this.spawnImmigrant();
    }
    this.maxResourcesPerOccupant =
      HouseBuilding.maxResourcesPerOccupantPerLevel[
        Math.min(
          nextLevel + 1,
          HouseBuilding.maxResourcesPerOccupantPerLevel.length - 1,
        )
      ];
    this.level = nextLevel;
  }

  reduceAccessAge() {
    for (let [key, life] of Object.entries(this.accessAge) as [
      keyof HouseAccess<number>,
      number,
    ][]) {
      this.accessAge[key] = Math.max(0, life - 1);
    }
  }
}

export const HouseUtils = {
  cellHasOccupants(cell: Cell): boolean {
    return HouseUtils.hasOccupants(cell.building);
  },
  hasOccupants(house: Building | null): boolean {
    return !!house && house.type === "house" && house.occupantCount > 0;
  },
};
