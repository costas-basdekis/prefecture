import { Immutable } from "./Immutable";
import { MutationHelper } from "./MutationHelper";

export type Mutable<I extends Immutable<Mutable<I>>> = {
  mutationHelper: MutationHelper<Mutable<I>, I>;
};
