import { mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import { WorkSearch, WorkSearchImmutable } from "./WorkSearch";
import { Buildings } from "./Buildings";
import { FoodGood, foodGoods } from "../goods";
import { GoodsDelivererPerson, Person } from "../people";
import { propById } from "~/utils";
import {
  BuildingWithContents,
  ContentStore,
  ContentStoreImmutable,
} from "./ContentStore";
import { FetchFromAvailableStoreMission } from "../people/missions";

declare module "./Building" {
  interface BuildingDefinitions {
    market: MarketBuilding;
  }
  interface BuildingImmutableDefinitions {
    market: MarketBuildingImmutable;
  }
}

export type MarketBuildingOptions = BaseBuildingOptions;

export type MarketBuildingImmutable = {
  workSearch: WorkSearchImmutable;
  contentStore: ContentStoreImmutable<FoodGood>;
} & BaseBuildingImmutable<MarketBuilding>;

export class MarketBuilding
  extends BaseBuilding<MarketBuilding, MarketBuildingImmutable, "market">
  implements BuildingWithContents<FoodGood>
{
  @mutable("mutable")
  workSearch: WorkSearch;
  @mutable("mutable")
  contentStore: ContentStore<FoodGood>;
  @mutable("plainValue")
  foodFetcherId: number | null;
  @propById<MarketBuilding, GoodsDelivererPerson, number>(
    "foodFetcherId",
    (id, thisObject) =>
      thisObject.buildings.game.people.byId[id] as GoodsDelivererPerson,
  )
  declare foodFetcher: GoodsDelivererPerson | null;

  constructor(buildings: Buildings, options: MarketBuildingOptions) {
    super(buildings, "market", options);
    this.workSearch = new WorkSearch(this as any);
    this.contentStore = new ContentStore<FoodGood>(this, [], false, false, 32);
    this.foodFetcherId = null;
    this.postInit();
  }

  tick(tickCount: number) {
    this.workSearch.tick(tickCount);
    this.fetchGoodsIfNecessary();
  }

  fetchGoodsIfNecessary() {
    if (this.foodFetcher) {
      return;
    }
    const wheatRequired =
      500 - this.contentStore.hasAmount("wheat", 500, false);
    if (wheatRequired > 0) {
      const firstCell = this.findFirstNeighbouringRoad();
      if (firstCell) {
        this.foodFetcher = FetchFromAvailableStoreMission.makePerson(
          this.buildings.game.people,
          { positionKey: firstCell.key, goodType: "wheat", goodAmount: 0 },
          {
            sourceBuildingId: this.id,
            goodType: "wheat",
            maxAmount: wheatRequired,
          },
        );
        this.foodFetcher.onRemoved.register(
          this.goodsDelivererRemoved.bind(this),
        );
      }
    }
  }

  goodsDelivererRemoved(person: Person) {
    if (this.foodFetcherId === person.id) {
      this.foodFetcher = null;
    }
  }
}
