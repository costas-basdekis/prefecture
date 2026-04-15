export interface BuildingDefinitions {}
export interface BuildingImmutableDefinitions {}

export type Building = BuildingDefinitions[keyof BuildingDefinitions];
export type BuildingImmutable =
  BuildingImmutableDefinitions[keyof BuildingImmutableDefinitions];
