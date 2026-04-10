import { Immutable } from "./Immutable";
import { MutationHelper } from "./MutationHelper";

export type Mutable<M extends Mutable<M, I>, I extends Immutable<M>> = {
  mutationHelper: MutationHelper<M, I, any, any>;
  getImmutable(): I;
};
