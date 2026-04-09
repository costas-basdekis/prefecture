import { MutationHelper } from "./MutationHelper";

export type Mutable<M, I> = {
  mutationHelper: MutationHelper<M, I, any, any>;
  getImmutable(): I;
};
