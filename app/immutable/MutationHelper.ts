import { Immutable } from "./Immutable";
import { Mutable } from "./Mutable";

export type MutableDirtyKeys<M, I, DK> = keyof {
  [key in keyof M & keyof I & DK as M[key] extends Mutable<infer M1, infer I1>
    ? I[key] extends Immutable<M1>
      ? key
      : never
    : never]: M[key];
};

export type MappedMutableDirtyKeys<M, I> = keyof {
  [key in keyof M & keyof I as M[key] extends Record<
    any,
    Mutable<infer M1, infer I1>
  >
    ? I[key] extends Record<any, Immutable<M1>>
      ? key
      : never
    : never]: M[key];
};

export class MutationHelper<M, I, DKO, DK = keyof DKO> {
  mutable: M;
  dirty: boolean;
  dirtyKeys: DKO;
  lastImmutable: I;

  constructor(mutable: M) {
    this.mutable = mutable;
    this.dirty = false;
    this.dirtyKeys = this.getInitialDirtyKeys();
    this.lastImmutable = this.getInitialLastImmutable();
  }

  getInitialDirtyKeys(): DKO {
    throw new Error(
      `Not implemented ${this.constructor.name}.getInitialDirtyKeys`,
    );
  }

  getInitialLastImmutable(): I {
    throw new Error(
      `Not implemented ${this.constructor.name}.getInitialLastImmutable`,
    );
  }

  markDirty(...keys: DK[]) {
    for (const key of keys) {
      this.markKeyDirty(key);
    }
    this.dirty = true;
  }

  markKeyDirty(key: DK) {
    if (typeof this.dirtyKeys[key as unknown as keyof DKO] !== "boolean") {
      throw new Error(
        `Dirty key "${key}" of ${this.constructor.name} is not a boolean`,
      );
    }
    this.dirtyKeys[key as unknown as keyof DKO] = true as any;
  }

  getImmutable(): I {
    return this.updateImmutable();
  }

  updateImmutable(): I {
    if (this.dirty) {
      this.lastImmutable = {
        ...this.lastImmutable,
      };
      this.updateImmutableDirtyKeys();
      this.dirty = false;
    }
    return this.lastImmutable;
  }

  updateImmutableDirtyKeys() {
    throw new Error(
      `Not implemented ${this.constructor.name}.updateImmutableDirtyKeys`,
    );
  }

  updateForMutable(key: MutableDirtyKeys<M, I, DK>) {
    const dkoKey = key as any as keyof DKO;
    if (typeof this.dirtyKeys[dkoKey] !== "boolean") {
      throw new Error(
        `Dirty key "${key.toString()}" for ${this.constructor.name} is not a boolean`,
      );
    }
    if (this.dirtyKeys[dkoKey]) {
      // @ts-ignore
      this.lastImmutable[key] = this.mutable[key].getImmutable();
      this.dirtyKeys[dkoKey] = false as DKO[typeof dkoKey];
    }
  }

  updateForPlainValue(key: DK) {
    const dkoKey = key as any as keyof DKO;
    if (typeof this.dirtyKeys[dkoKey] !== "boolean") {
      throw new Error(
        `Dirty key "${dkoKey.toString()}" for ${this.constructor.name} is not a boolean`,
      );
    }
    if (this.dirtyKeys[dkoKey]) {
      // @ts-ignore
      this.lastImmutable[key] = this.mutable[key];
      this.dirtyKeys[dkoKey] = false as DKO[typeof dkoKey];
    }
  }

  updateForMappedMutable<MK>(key: MappedMutableDirtyKeys<M, I>) {
    const dkoKey = key as any as keyof DKO;
    if (!(this.dirtyKeys[dkoKey] instanceof Set)) {
      throw new Error(
        `Dirty key "${dkoKey.toString()}" for ${this.constructor.name} is not a set`,
      );
    }
    const dirtyMappedKeys: Set<MK> = this.dirtyKeys[dkoKey];
    if (dirtyMappedKeys.size) {
      this.lastImmutable[key] = { ...this.lastImmutable[key] };
      for (const mappedKey of dirtyMappedKeys) {
        // @ts-ignore
        this.lastImmutable[key][mappedKey] =
          // @ts-ignore
          this.mutable[key][mappedKey].getImmutable();
      }
      dirtyMappedKeys.clear();
    }
  }
}
