import {
  immutable,
  Immutable,
  mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import type { Building } from "../Building";
import type { HouseAccessType, HouseBuilding } from "../HouseBuilding";
import { type Person, WandererPerson } from "~/game/people";
import type { BuildingWithWorkSearch } from "./WorkSearch";
import type { Cell } from "~/game/Cell";

export interface BuildingWithServiceSpread {
  serviceSpread: ServiceSpread;
}

export type ServiceSpreadImmutable = Pick<ServiceSpread, "serviceSpreaderId"> &
  Immutable<ServiceSpread>;

export class ServiceSpread {
  mutationHelper: MutationHelper<ServiceSpread, ServiceSpreadImmutable>;
  @parentKey("serviceSpread")
  building: Building & BuildingWithServiceSpread & BuildingWithWorkSearch;
  @immutable
  serviceName: HouseAccessType;
  @immutable
  serviceSpreaderName: string;
  @mutable("plainValueById")
  serviceSpreader: WandererPerson | null;
  declare serviceSpreaderId: number | null;
  lastServiceSpreaderVisitedByCell: Map<Cell, number>;

  constructor(
    building: Building & BuildingWithServiceSpread & BuildingWithWorkSearch,
    serviceName: HouseAccessType,
    serviceSpreaderName: string,
  ) {
    this.building = building;
    this.serviceName = serviceName;
    this.serviceSpreaderName = serviceSpreaderName;
    this.serviceSpreader = null;
    this.lastServiceSpreaderVisitedByCell = new Map();
    this.mutationHelper = new MutationHelper<
      ServiceSpread,
      ServiceSpreadImmutable
    >(this);
  }

  tick(_tickCount: number) {
    if (!this.building.workSearch.hasWorkerAccess) {
      return;
    }
    if (this.serviceSpreader) {
      return;
    }
    const firstCell = this.building.findFirstNeighbouringRoad();
    if (!firstCell) {
      return;
    }
    this.serviceSpreader = new WandererPerson(
      this.building.buildings.game.people,
      {
        secondaryType: this.serviceSpreaderName,
        sourceBuilding: this.building,
        lastVisitedByCell: this.lastServiceSpreaderVisitedByCell,
        cell: firstCell,
      },
    );
    this.serviceSpreader.onPassedHouse.register(
      this.serviceSpreaderPassedHouse.bind(this),
    );
    this.serviceSpreader.onRemoved.register(
      this.serviceSpreaderRemoved.bind(this),
    );
  }

  serviceSpreaderPassedHouse(passedHouseCells: Cell[]) {
    const houses = new Set(
      passedHouseCells.map((cell) => cell.building),
    ) as Set<HouseBuilding>;
    for (const house of houses) {
      house.accessAge[this.serviceName] = 50;
    }
  }

  serviceSpreaderRemoved(person: Person) {
    if (this.serviceSpreader === person) {
      this.serviceSpreader = null;
    }
  }
}
