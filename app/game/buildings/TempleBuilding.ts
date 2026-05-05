import { mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import { WorkSearch, WorkSearchImmutable } from "./WorkSearch";
import { Buildings } from "./Buildings";
import { Person, WandererPerson } from "../people";
import { Cell } from "../Cell";
import { HouseBuilding } from "./HouseBuilding";

declare module "./Building" {
  interface BuildingDefinitions {
    temple: TempleBuilding;
  }
  interface BuildingImmutableDefinitions {
    temple: TempleBuildingImmutable;
  }
}

export type TempleBuildingOptions = BaseBuildingOptions;

export type TempleBuildingImmutable = {
  workSearch: WorkSearchImmutable;
} & BaseBuildingImmutable<TempleBuilding>;

export class TempleBuilding extends BaseBuilding<
  TempleBuildingImmutable,
  "temple"
> {
  @mutable("mutable")
  workSearch: WorkSearch;
  @mutable("plainValueById")
  priest: WandererPerson | null;
  declare priestId: number | null;
  lastPriestVisitedByCell: Map<Cell, number>;

  constructor(buildings: Buildings, options: TempleBuildingOptions) {
    super(buildings, "temple", options);
    this.workSearch = new WorkSearch(this as any);
    this.priest = null;
    this.lastPriestVisitedByCell = new Map();
    this.postInit();
  }

  tick(tickCount: number) {
    this.workSearch.tick(tickCount);
    this.spreadGoodsIfAny();
  }

  spreadGoodsIfAny() {
    if (!this.workSearch.hasWorkerAccess) {
      return;
    }
    if (this.priest) {
      return;
    }
    const firstCell = this.findFirstNeighbouringRoad();
    if (!firstCell) {
      return;
    }
    this.priest = new WandererPerson(this.buildings.game.people, {
      secondaryType: "priest",
      sourceBuilding: this,
      lastVisitedByCell: this.lastPriestVisitedByCell,
      cell: firstCell,
    });
    this.priest.onPassedHouse.register(this.priestPassedHouse.bind(this));
    this.priest.onRemoved.register(this.priestRemoved.bind(this));
  }

  priestPassedHouse(passedHouseCells: Cell[]) {
    const houses = new Set(
      passedHouseCells.map((cell) => cell.building),
    ) as Set<HouseBuilding>;
    for (const house of houses) {
      house.accessAge.temple = 50;
    }
  }

  priestRemoved(person: Person) {
    if (this.priest === person) {
      this.priest = null;
    }
  }
}
