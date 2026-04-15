export const farmGoods = ["wheat"] as const;
export type FarmGood = (typeof farmGoods)[number];
export const foodGoods = farmGoods;
export type FoodGood = (typeof foodGoods)[number];
export const goods = foodGoods;
export type Good = (typeof goods)[number];
