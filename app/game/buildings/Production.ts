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
  production: Production<any>;
}

export type ProductionImmutable<B extends Building & BuildingWithWorkerFinder> =
  Pick<Production<B>, "process" | "maxProcess" | "maxProcess"> &
    Immutable<Production<B>>;

export class Production<
  B extends Building & BuildingWithWorkerFinder,
> implements Mutable<Production<B>, ProductionImmutable<B>> {
  mutationHelper: MutationHelper<Production<B>, ProductionImmutable<B>>;
  @parentKey("production")
  building: B;
  @immutable
  processRate: number;
  @immutable
  maxProcess: number;
  @mutable("plainValue")
  process: number;

  constructor(building: B, processRate: number, maxProcess: number) {
    this.building = building;
    this.processRate = processRate;
    this.process = 0;
    this.maxProcess = maxProcess;
    this.mutationHelper = new MutationHelper<
      Production<B>,
      ProductionImmutable<B>
    >(this);
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
