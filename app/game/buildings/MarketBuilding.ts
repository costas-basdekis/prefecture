import { mutable } from "~/immutable";
import {
  BaseBuilding,
  BaseBuildingImmutable,
  BaseBuildingOptions,
} from "./BaseBuilding";
import { WorkSearch, WorkSearchImmutable } from "./WorkSearch";
import { Buildings } from "./Buildings";
import { FoodGood, Good } from "../goods";
import { GoodsDelivererPerson, Person, WandererPerson } from "../people";
import { propById } from "~/utils";
import {
  BuildingWithContents,
  ContentStore,
  ContentStoreImmutable,
} from "./ContentStore";
import { FetchFromAvailableStoreMission } from "../people/missions";
import { Cell } from "../Cell";
import { HouseBuilding } from "./HouseBuilding";

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
  @mutable("plainValue")
  sellerId: number | null;
  @propById<MarketBuilding, WandererPerson, number>(
    "sellerId",
    (id, thisObject) =>
      thisObject.buildings.game.people.byId[id] as WandererPerson,
  )
  declare seller: WandererPerson | null;
  lastSellerVisitedByCell: Map<Cell, number>;

  constructor(buildings: Buildings, options: MarketBuildingOptions) {
    super(buildings, "market", options);
    this.workSearch = new WorkSearch(this as any);
    this.contentStore = new ContentStore<FoodGood>(this, {
      acceptableGoods: [],
      acceptsExternalDeliveries: false,
      allowsExternalPickups: false,
      capacity: 32,
    });
    this.foodFetcherId = null;
    this.sellerId = null;
    this.lastSellerVisitedByCell = new Map();
    this.postInit();
  }

  tick(tickCount: number) {
    this.workSearch.tick(tickCount);
    this.fetchGoodsIfNecessary();
    this.spreadGoodsIfAny();
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

  spreadGoodsIfAny() {
    if (!this.workSearch.hasWorkerAccess) {
      return;
    }
    if (this.seller) {
      return;
    }
    if (this.contentStore.isEmpty()) {
      return;
    }
    const firstCell = this.findFirstNeighbouringRoad();
    if (!firstCell) {
      return;
    }
    this.seller = new WandererPerson(this.buildings.game.people, {
      secondaryType: "marketSeller",
      sourceBuildingId: this.id,
      lastVisitedByCell: this.lastSellerVisitedByCell,
      positionKey: firstCell.key,
    });
    this.seller.onPassedHouse.register(this.sellerPassedHouse.bind(this));
    this.seller.onRemoved.register(this.sellerRemoved.bind(this));
  }

  sellerPassedHouse(passedHouseCells: Cell[]) {
    const houses = new Set(
      passedHouseCells.map((cell) => cell.building),
    ) as Set<HouseBuilding>;
    for (const house of houses) {
      for (const [good, amount] of Object.entries(this.contentStore.contents)) {
        const houseAmount = house.resources[good as Good] ?? 0;
        const maxHouseAmountPerOccupant =
          house.maxResourcesPerOccupant[good as Good] ?? 0;
        const maxHouseAmount = maxHouseAmountPerOccupant * house.occupantCount;
        const missingHouseAmount = Math.min(
          maxHouseAmount - houseAmount,
          amount,
        );
        if (missingHouseAmount > 0) {
          house.resources[good as Good] = houseAmount + missingHouseAmount;
          this.contentStore.contents[good as Good] =
            amount - missingHouseAmount;
        }
      }
    }
  }

  sellerRemoved(person: Person) {
    if (this.sellerId === person.id) {
      this.seller = null;
    }
  }
}
