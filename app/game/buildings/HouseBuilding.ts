import { mutable } from "~/immutable";
import type { Buildings } from "./Buildings";
import { ImmigrantPerson, Person } from "../people";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import type { Cell } from "../Cell";
import { propById } from "~/utils";
import { CellWaterCoverage } from "./WaterCoverage";

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
    this.buildings.game.grid.waterCoverage.registerOnLevelUpdated(
      this.onWaterCoverageUpdated.bind(this),
      this.cells,
    );
    this.updateLevel(this.cells[0]);
  }

  spawnImmigrant() {
    if (this.occupantCount < this.maxOccupantCount) {
      this.immigrant = new ImmigrantPerson(this.buildings.game.people, {
        targetBuildingId: this.id,
      });
      this.immigrant.onRemoved.register(this.immigrantRemoved.bind(this));
      this.immigrant.onArrived.register(this.onImmigrantArrived.bind(this));
    }
  }

  onImmigrantArrived(immigrant: ImmigrantPerson) {
    if (this.immigrantId !== immigrant.id) {
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
    if (this.immigrantId === immigrant.id) {
      this.immigrant = null;
      this.spawnImmigrant();
    }
  }

  onWaterCoverageUpdated(waterCoverage: CellWaterCoverage) {
    this.updateLevel(waterCoverage.cell);
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
    this.level = nextLevel;
  }
}
