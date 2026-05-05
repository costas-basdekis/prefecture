export interface BuildingDefinitions {}
export interface BuildingImmutableDefinitions {}

export type Building = BuildingDefinitions[keyof BuildingDefinitions];
export type BuildingType = Building["type"];
export type BuildingByType = {
  [key in BuildingType]: Extract<Building, { type: key }>;
};

export type BuildingImmutable =
  BuildingImmutableDefinitions[keyof BuildingImmutableDefinitions];
