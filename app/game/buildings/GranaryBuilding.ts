import { mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import { Buildings } from "./Buildings";
import { WorkSearch, WorkSearchImmutable } from "./WorkSearch";
import { FoodGood, foodGoods } from "../goods";
import {
  BuildingWithContents,
  ContentStore,
  ContentStoreImmutable,
} from "./ContentStore";

declare module "./Building" {
  interface BuildingDefinitions {
    granary: GranaryBuilding;
  }
  interface BuildingImmutableDefinitions {
    granary: GranaryBuildingImmutable;
  }
}

export type GranaryBuildingOptions = BaseBuildingOptions;

export type GranaryBuildingImmutable = {
  workSearch: WorkSearchImmutable;
  contentStore: ContentStoreImmutable<FoodGood>;
} & BaseBuildingImmutable<GranaryBuilding>;

export class GranaryBuilding
  extends BaseBuilding<GranaryBuilding, GranaryBuildingImmutable, "granary">
  implements BuildingWithContents<FoodGood>
{
  @mutable("mutable")
  workSearch: WorkSearch;
  @mutable("mutable")
  contentStore: ContentStore<FoodGood>;

  constructor(buildings: Buildings, options: GranaryBuildingOptions) {
    super(buildings, "granary", options);
    this.workSearch = new WorkSearch(this);
    this.contentStore = new ContentStore<FoodGood>(
      this,
      foodGoods,
      true,
      true,
      32,
    );
    this.postInit();
  }

  tick(tickCount: number) {
    this.workSearch.tick(tickCount);
  }
}
