import { MutationHelper } from "./MutationHelper";

export type Mutable<M extends Mutable<any, any>, I> = {
  mutationHelper: MutationHelper<M, I, any, any>;
  getImmutable(): I;
};
