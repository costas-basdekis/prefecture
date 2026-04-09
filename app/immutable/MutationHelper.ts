export class MutationHelper<M, I, DKO, DK extends string = keyof DKO & string> {
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
        `Dirty key "${key.toString()}" of ${this.constructor.name} is not a boolean`,
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
}
