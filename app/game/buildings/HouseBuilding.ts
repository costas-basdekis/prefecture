import { mutable } from "~/immutable";
import type { Buildings } from "./Buildings";
import { ImmigrantPerson } from "../people";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import { Cell } from "../Cell";
import { propById } from "~/utils";

export type HouseOptions = BaseBuildingOptions;

export type HouseBuildingImmutable = Pick<
  HouseBuilding,
  "level" | "occupantCount" | "maxOccupantCount" | "immigrantId"
> &
  BaseBuildingImmutable<HouseBuilding>;

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
  @mutable("plainValue")
  immigrantId: number | null;
  @propById(
    "immigrantId",
    (id: number, thisObject: HouseBuilding) =>
      thisObject.buildings.game.people.byId[id],
  )
  declare immigrant: ImmigrantPerson | null;

  static maxOccupantCountMap: number[] = [
    0, 3, 7, 12, 18, 25, 33, 42, 52, 63, 75,
  ];
  static requirementsByLevel: Partial<{ waterCoverage: number }>[] = [
    {},
    {},
    { waterCoverage: 1 },
  ];

  constructor(buildings: Buildings, options: BaseBuildingOptions) {
    super(buildings, "house", options);
    this.level = 0;
    this.occupantCount = 0;
    this.maxOccupantCount = 0;
    this.immigrantId = null;
    this.postInit();
    this.updateLevel();
  }

  get cell(): Cell {
    return this.buildings.game.grid.cellMap[this.positionKey];
  }

  spawnImmigrantIfNecessary() {
    if (this.occupantCount < this.maxOccupantCount) {
      this.spawnImmigrant();
    }
  }

  spawnImmigrant() {
    this.immigrant = new ImmigrantPerson(this.buildings.game.people, {
      targetBuildingId: this.id,
    });
  }

  immigrantArrived(immigrant: ImmigrantPerson) {
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
    this.spawnImmigrantIfNecessary();
  }

  immigrantRemoved(_immigrant: ImmigrantPerson) {
    this.immigrant = null;
    this.spawnImmigrantIfNecessary();
  }

  waterCoverageUpdated(cell: Cell) {
    this.updateLevel(cell);
  }

  updateLevel(cell: Cell = this.cell) {
    const nextLevel = HouseBuilding.requirementsByLevel.findLastIndex(
      (level) => {
        if (level.waterCoverage) {
          if (cell.waterCoverage < level.waterCoverage) {
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
      this.spawnImmigrantIfNecessary();
    }
    this.level = nextLevel;
  }
}
