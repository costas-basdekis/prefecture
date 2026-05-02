import "reflect-metadata";
import { Immutable } from "./Immutable";
import { Mutable } from "./Mutable";
import { TrackedMetadata } from "./TrackedMetadata";

export type DirtyKeys = {
  [key: string | symbol]: boolean | Set<string | number>;
};

export type DirtyKey = string | symbol | [string | symbol, string | number];

export class MutationHelper<M extends Mutable<I>, I extends Immutable<M>> {
  mutable: M;
  dirty: boolean;
  dirtyKeys: DirtyKeys;
  lastImmutable: I;

  constructor(mutable: M) {
    this.mutable = mutable;
    this.dirty = false;
    this.dirtyKeys = this.getInitialDirtyKeys();
    this.lastImmutable = this.getInitialImmutable();
  }

  /* Get a mutator method to prevent updates if we are not looking at the latest immutable */
  getIfAtLatestMutator(
    callback: (func: (newImmutable: I) => I) => void,
  ): (newImmutableOrFunc: I | ((game: I) => I)) => void {
    return (newImmutableOrFunc: I | ((game: I) => I)) => {
      callback((immutable: I) =>
        this.mutateIfAtLatest(immutable, newImmutableOrFunc),
      );
    };
  }

  /* Prevent updates if we are not looking at the latest immutable */
  mutateIfAtLatest(
    immutable: I,
    newImmutableOrFunc: I | ((immutable: I) => I),
  ): I {
    if (this.lastImmutable !== immutable) {
      return this.lastImmutable;
    }
    if (typeof newImmutableOrFunc === "function") {
      return newImmutableOrFunc(immutable);
    }
    return newImmutableOrFunc;
  }

  getInitialDirtyKeys(): DirtyKeys {
    const metadata = TrackedMetadata.get(this.mutable);
    return Object.fromEntries(
      Array.from(metadata.propertyMap.values()).map((property) => [
        property.key,
        property.getInitialDirtyKey(),
      ]),
    );
  }

  getInitialImmutable(): I {
    const immutable: Partial<I> = { _mutable: this.mutable } as Partial<I>;
    const metadata = TrackedMetadata.get(this.mutable);
    for (const property of metadata.propertyMap.values()) {
      property.addInitialToImmutable(this.mutable, immutable);
    }
    return immutable as I;
  }

  markDirty(...keys: DirtyKey[]) {
    for (const key of keys) {
      this.markKeyDirty(key);
    }
    if (!this.dirty) {
      this.dirty = true;
      this.markParentDirty();
    }
  }

  markParentDirty() {
    const metadata = TrackedMetadata.get(this.mutable);
    const parentInfo = metadata.parentInfo;
    if (!parentInfo) {
      return;
    }
    if (parentInfo.secondaryKey) {
      (
        this.mutable[parentInfo.key as keyof M] as Mutable<any>
      ).mutationHelper.markDirty([
        parentInfo.dirtyKey as string,
        this.mutable[parentInfo.secondaryKey as keyof M] as any,
      ]);
    } else {
      (
        this.mutable[parentInfo.key as keyof M] as Mutable<any>
      ).mutationHelper.markDirty(parentInfo.dirtyKey as string);
    }
  }

  markKeyDirty(key: DirtyKey) {
    if (Array.isArray(key)) {
      const [actualKey, secondaryKey] = key;

      const dirtyKeyValue = this.dirtyKeys[actualKey];
      if (!(dirtyKeyValue instanceof Set)) {
        throw new Error(
          `Dirty key [${key.map((subKey) => `"${subKey.toString()}"`).join(", ")}] of ${this.constructor.name} is not a set, but ${typeof dirtyKeyValue}`,
        );
      }
      dirtyKeyValue.add(secondaryKey);
      return;
    }
    const dirtyKeyValue = this.dirtyKeys[key];
    if (typeof dirtyKeyValue !== "boolean") {
      throw new Error(
        `Dirty key "${key.toString()}" of ${this.constructor.name} is not a boolean`,
      );
    }
    this.dirtyKeys[key] = true as any;
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
    const metadata = TrackedMetadata.get(this.mutable);
    for (const property of metadata.propertyMap.values()) {
      property.updateImmutable(
        this.mutable,
        this.lastImmutable,
        this.dirtyKeys,
      );
    }
  }
}
