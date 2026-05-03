import {
  FarmBuilding,
  GranaryBuilding,
  HouseBuilding,
  MarketBuilding,
} from "../buildings";
import { selectCells } from "../CellSelectionMode";
import { Story } from "./story";

export const feedHouses = Story.add("Feed houses")
  .do((game) => {
    game.addRoads(
      selectCells("line-clockwise", { x: 2, y: 2 }, { x: 5, y: 5 }),
    );
    game.addHouses(selectCells("square", { x: 3, y: 3 }, { x: 4, y: 4 }));
  })
  .tickMany(1)
  .check((game, expect) => {
    const houses = game.buildings.getOfType("house") as HouseBuilding[];
    expect(houses.length).toEqual(4);
    for (const house of houses) {
      expect(house.level).toEqual(1);
      expect(house.occupantCount).toEqual(0);
      expect(house.immigrant).not.toBeNull();
    }
  }, "4 houses have no occupants and an immigrant each")
  .tickUntil(
    10,
    (game) => {
      const houses = game.buildings.getOfType("house") as HouseBuilding[];
      return !houses.some((house) => house.immigrant);
    },
    "no houses have an immigrant anymore",
  )
  .tickMany(1)
  .check((game, expect) => {
    const houses = game.buildings.getOfType("house") as HouseBuilding[];
    expect(houses.length).toEqual(4);
    for (const house of houses) {
      expect(house.occupantCount).toEqual(3);
    }
  }, "4 houses have 3 occupants each")
  .do((game) => {
    game.addWell({ x: 4, y: 5 });
    game.tick();
  })
  .check((game, expect) => {
    const houses = game.buildings.getOfType("house") as HouseBuilding[];
    expect(houses.length).toEqual(4);
    for (const house of houses) {
      expect(house.level).toEqual(2);
      expect(house.occupantCount).toEqual(3);
      expect(house.immigrant).not.toBeNull();
    }
  }, "4 houses are level 2, have 3 ocupants each, and an immigrant each")
  .tickUntil(
    10,
    (game) => {
      const houses = game.buildings.getOfType("house") as HouseBuilding[];
      return !houses.some((house) => house.immigrant);
    },
    "no houses have immigrants anymore",
  )
  .tickMany(1)
  .check((game, expect) => {
    const houses = game.buildings.getOfType("house") as HouseBuilding[];
    expect(houses.length).toEqual(4);
    for (const house of houses) {
      expect(house.occupantCount).toEqual(7);
    }
  }, "4 houses have 7 occupants each")
  .do((game) => {
    game.addFarm({ x: 6, y: 0 }, { productionOutput: "wheat" });
    game.addGranary({ x: 5, y: 6 });
    game.addMarket({ x: 6, y: 3 });
  })
  .check((game, expect) => {
    expect(
      (game.buildings.getOfType("farm")[0] as FarmBuilding).workSearch
        .hasWorkerAccess,
    ).not.toBeTruthy();
    expect(
      (game.buildings.getOfType("granary")[0] as GranaryBuilding).workSearch
        .hasWorkerAccess,
    ).not.toBeTruthy();
    expect(
      (game.buildings.getOfType("market")[0] as MarketBuilding).workSearch
        .hasWorkerAccess,
    ).not.toBeTruthy();
  }, "farm, granary, and market don't have worker access by default")
  .tickMany(1)
  .check((game, expect) => {
    expect(
      (game.buildings.getOfType("farm")[0] as FarmBuilding).workSearch
        .workerFinder,
    ).not.toBeNull();
    expect(
      (game.buildings.getOfType("granary")[0] as GranaryBuilding).workSearch
        .workerFinder,
    ).not.toBeNull();
    expect(
      (game.buildings.getOfType("market")[0] as MarketBuilding).workSearch
        .workerFinder,
    ).not.toBeNull();
  }, "farm, granary, and market have a work searcher")
  .tickMany(1)
  .check((game, expect) => {
    expect(
      (game.buildings.getOfType("farm")[0] as FarmBuilding).workSearch
        .hasWorkerAccess,
    ).toBeTruthy();
    expect(
      (game.buildings.getOfType("granary")[0] as GranaryBuilding).workSearch
        .hasWorkerAccess,
    ).toBeTruthy();
    expect(
      (game.buildings.getOfType("market")[0] as MarketBuilding).workSearch
        .hasWorkerAccess,
    ).toBeTruthy();
  }, "farm, granary, and market have worker access")
  .tickUntil(
    5,
    (game) => {
      return (
        (game.buildings.getOfType("farm")[0] as FarmBuilding).production
          .process > 0
      );
    },
    "production starts at the farm",
  )
  .tickUntil(
    10,
    (game) => {
      const farm = game.buildings.getOfType("farm")[0] as FarmBuilding;
      const deliverer = farm.productionDelivery.goodsDeliverer;
      if (!deliverer) {
        return "no deliverer";
      }
      if (deliverer.goodType !== "wheat") {
        return `deliverer has ${deliverer.goodType} rather than wheat`;
      }
      if (deliverer.goodAmount !== 1) {
        return `deliverer has ${deliverer.goodAmount} wheat rather than 1`;
      }
      return true;
    },
    "production finishes at farm and is out for delivery",
  )
  .tickUntil(
    5,
    (game) => {
      const farm = game.buildings.getOfType("farm")[0] as FarmBuilding;
      const granary = game.buildings.getOfType("granary")[0] as GranaryBuilding;
      const deliverer = farm.productionDelivery.goodsDeliverer;
      if (deliverer && deliverer.goodAmount !== 0) {
        return "deliverer still has the wheat";
      }
      const granaryWheat = granary.contentStore.contents.wheat ?? 0;
      if (granaryWheat !== 1) {
        return `granary doesn't have exactly 1 wheat, it has ${granaryWheat}`;
      }
      return true;
    },
    "farm delivers to granary",
  )
  .tickUntil(
    5,
    (game) => {
      const market = game.buildings.getOfType("market")[0] as MarketBuilding;
      const marketWheat = market.contentStore.contents.wheat ?? 0;
      const houses = game.buildings.getOfType("house") as HouseBuilding[];
      if (
        marketWheat === 0 &&
        (!market.foodFetcher || market.foodFetcher.goodAmount === 0) &&
        !houses.some((house) => (house.resources.wheat ?? 0) > 0)
      ) {
        return "market, fetcher, and houses have no wheat";
      }
      return true;
    },
    "market picks up wheat",
  )
  .tickMany(50)
  .check((game, expect) => {
    const houses = game.buildings.getOfType("house") as HouseBuilding[];
    expect(houses.length).toEqual(4);
    for (const house of houses) {
      expect(house.occupantCount).toEqual(12);
    }
  }, "4 houses have 13 occupants each");
