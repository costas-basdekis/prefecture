import { MutationHelper } from "~/immutable";

export type MutableDirtyKeys<M, I> = keyof {
  [key in keyof M & keyof I as M[key] extends {
    mutationHelper: MutationHelper<any, any, any, any>;
  }
    ? I[key] extends { _mutable: any }
      ? key
      : never
    : never]: M[key];
};
