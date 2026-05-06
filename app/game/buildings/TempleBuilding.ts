import { mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import { ServiceSpread, WorkSearch, WorkSearchImmutable } from "./addons";
import { Buildings } from "./Buildings";

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
  @mutable("mutable")
  serviceSpread: ServiceSpread;

  constructor(buildings: Buildings, options: TempleBuildingOptions) {
    super(buildings, "temple", options);
    this.workSearch = new WorkSearch(this as any);
    this.serviceSpread = new ServiceSpread(this, "temple", "priest");
    this.postInit();
  }

  tick(tickCount: number) {
    this.workSearch.tick(tickCount);
    this.serviceSpread.tick(tickCount);
  }
}
