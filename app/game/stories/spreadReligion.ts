import { HouseBuilding, TempleBuilding } from "../buildings";
import { feedHouses } from "./feedHouses";

export const spreadReligion = feedHouses
  .extendAndAdd("Spread religion")
  .do((game) => {
    game.addTemple({ x: 2, y: 0 });
  })
  .tickUntil(
    10,
    (game) => {
      const temple = game.buildings.getOfType("temple")[0];
      if (!temple.workSearch.hasWorkerAccess) {
        return "no worker access";
      }
      if (!temple.priest) {
        return "no priest";
      }
      return true;
    },
    "a priest roams",
  )
  .tickUntil(
    10,
    (game) => {
      const houses = game.buildings.getOfType("house");
      const housesWithoutTempleAccess = houses.filter(
        (house) => house.accessAge.temple === 0,
      );
      if (housesWithoutTempleAccess.length) {
        return `${housesWithoutTempleAccess.length} houses without temple access`;
      }
      return true;
    },
    "all houses get access",
  )
  .tickUntil(
    10,
    (game) => {
      const houses = game.buildings.getOfType("house");
      const houseNotAtLevel4 = houses.filter((house) => house.level < 4);

      if (houseNotAtLevel4.length) {
        return `${houseNotAtLevel4.length} houses at level less than 4`;
      }
      return true;
    },
    "all houses have upgraded",
  );
