import {
  immutable,
  Immutable,
  mutable,
  Mutable,
  MutationHelper,
  parentKey,
} from "~/immutable";
import { Building } from "./Building";
import { BuildingWithWorkerFinder } from "./WorkSearch";

export interface BuildingWithProduction {
  production: Production;
}

export type ProductionImmutable = Pick<
  Production,
  "process" | "maxProcess" | "maxProcess"
> &
  Immutable<Production>;

export class Production implements Mutable<Production, ProductionImmutable> {
  mutationHelper: MutationHelper<Production, ProductionImmutable>;
  @parentKey("production")
  building: Building & BuildingWithWorkerFinder;
  @immutable
  processRate: number;
  @immutable
  maxProcess: number;
  @mutable("plainValue")
  process: number;

  constructor(
    building: Building & BuildingWithWorkerFinder,
    processRate: number,
    maxProcess: number,
  ) {
    this.building = building;
    this.processRate = processRate;
    this.process = 0;
    this.maxProcess = maxProcess;
    this.mutationHelper = new MutationHelper<Production, ProductionImmutable>(
      this,
    );
  }

  tick(_tickCount: number) {
    if (
      this.building.workSearch.hasWorkerAccess &&
      this.process < this.maxProcess
    ) {
      this.process = Math.min(this.maxProcess, this.process + this.processRate);
    }
  }
}
