export interface PersonDefinitions {}
export interface PersonImmutableDefinitions {}

export type Person = PersonDefinitions[keyof PersonDefinitions];
export type PersonImmutable =
  PersonImmutableDefinitions[keyof PersonImmutableDefinitions];
