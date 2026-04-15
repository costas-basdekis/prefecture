import { immutable, mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import { Buildings } from "./Buildings";
import { WorkSearch, WorkSearchImmutable } from "./WorkSearch";
import { FoodGood } from "../goods";

export type GranaryBuildingOptions = BaseBuildingOptions;

export type GranaryBuildingImmutable = Pick<
  GranaryBuilding,
  "capacity" | "contents"
> & {
  workSearch: WorkSearchImmutable;
} & BaseBuildingImmutable<GranaryBuilding>;

export class GranaryBuilding extends BaseBuilding<
  GranaryBuilding,
  GranaryBuildingImmutable,
  "granary"
> {
  @mutable("mutable")
  workSearch: WorkSearch;
  @immutable
  capacity: number;
  @mutable("plainValueMap")
  contents: Partial<Record<FoodGood, number>>;

  constructor(buildings: Buildings, options: GranaryBuildingOptions) {
    super(buildings, "granary", options);
    this.workSearch = new WorkSearch(this);
    this.capacity = 32;
    this.contents = {};
    this.postInit();
  }

  tick(tickCount: number) {
    this.workSearch.tick(tickCount);
  }
}
