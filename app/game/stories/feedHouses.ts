import { HouseBuilding } from "../buildings";
import { selectCells } from "../CellSelectionMode";
import { Story } from "./story";

export const feedHouses = Story.add("Feed houses")
  .do((game) => {
    game.addRoads(
      selectCells("line-clockwise", { x: 2, y: 2 }, { x: 5, y: 5 }),
    );
    game.addHouses(selectCells("square", { x: 3, y: 3 }, { x: 4, y: 4 }));
    game.tick();
  })
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
  }, "4 houses have 7 occupants each");
