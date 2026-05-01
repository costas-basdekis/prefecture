import "reflect-metadata";
import { Immutable } from "./Immutable";
import { Mutable } from "./Mutable";
import { TrackedMetadata } from "./TrackedMetadata";
import { makeTrackedProperty, MutationType } from "./properties";

export function immutable(target: Object, propertyKey: string | symbol) {
  const metadata = TrackedMetadata.getOrSet(target);
  const existingProperty = metadata.propertyMap.get(propertyKey);
  if (existingProperty) {
    throw new Error(
      `Immutable key was already defined (${propertyKey.toString()})${existingProperty.type === "immutable" ? "" : " as mutable"} for ${target}`,
    );
  }
  metadata.propertyMap.set(
    propertyKey,
    makeTrackedProperty(propertyKey, "plainValue", false, null),
  );
}

export function mutable(
  type: Exclude<MutationType, "plainValueById">,
): PropertyDecorator;
export function mutable(
  type: "plainValueById",
  idKey?: string,
  idPropertyKey?: string,
): PropertyDecorator;
export function mutable(
  type: MutationType,
  idKey: string = "id",
  idPropertyKey?: string,
): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    const metadata = TrackedMetadata.getOrSet(target);
    const existingProperty = metadata.propertyMap.get(propertyKey);
    if (existingProperty) {
      throw new Error(
        `Mutable key was already defined (${propertyKey.toString()})${existingProperty.mutable ? "" : " as immutable"} for ${target}`,
      );
    }
    const property = makeTrackedProperty(
      propertyKey,
      type,
      true,
      type === "plainValueById"
        ? {
            idKey: idKey ?? "id",
            idPropertyKey: idPropertyKey ?? `${propertyKey.toString()}Id`,
          }
        : null,
    );
    metadata.propertyMap.set(propertyKey, property);
    property.addProperties(target);
  };
}

export function methodMutate(target: Object, propertyKey: string | symbol) {
  const metadata = TrackedMetadata.getOrSet(target);
  metadata.keysWithMethodMutationType.add(propertyKey);
}

export function parentKey(dirtyKey: string) {
  return function (target: Object, propertyKey: string | symbol) {
    const metadata = TrackedMetadata.getOrSet(target);
    if (metadata.parentInfo) {
      throw new Error(
        `Parent key was already defined (${metadata.parentInfo.key.toString()}) for ${target}`,
      );
    }
    metadata.parentInfo = {
      key: propertyKey,
      dirtyKey,
      secondaryKey: null,
    };
  };
}

export function parentSecondaryKey(
  target: Object,
  propertyKey: string | symbol,
) {
  const metadata = TrackedMetadata.getOrSet(target);
  if (!metadata.parentInfo) {
    throw new Error(`Not parent relationship has been defined for ${target}`);
  }
  if (metadata.parentInfo.secondaryKey) {
    throw new Error(
      `Parent secondary key was already defined (${metadata.parentInfo.secondaryKey.toString()}) for ${target}`,
    );
  }
  metadata.parentInfo.secondaryKey = propertyKey;
}

export type DirtyKeys = {
  [key: string | symbol]: boolean | Set<string | number>;
};

export type DirtyKey = string | symbol | [string | symbol, string | number];

export class MutationHelper<M extends Mutable<M, I>, I extends Immutable<M>> {
  mutable: M;
  dirty: boolean;
  dirtyKeys: DirtyKeys;
  lastImmutable: I;

  constructor(mutable: M, initialExtraImmutable?: Partial<I>) {
    this.mutable = mutable;
    this.dirty = false;
    this.dirtyKeys = this.getInitialDirtyKeys();
    this.lastImmutable = this.getInitialImmutable(initialExtraImmutable);
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
  ) {
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

  getInitialImmutable(initialExtraImmutable?: Partial<I>): I {
    return {
      ...this.getDefaultInitialImmutable(),
      ...initialExtraImmutable,
    };
  }

  getDefaultInitialImmutable(): I {
    const immutable: Partial<I> = { _mutable: this.mutable } as Partial<I>;
    const metadata = TrackedMetadata.get(this.mutable);
    for (const property of metadata.propertyMap.values()) {
      property.addInitialToImmutable(this.mutable, immutable);
    }
    for (const key of metadata.keysWithMethodMutationType as Set<keyof I>) {
      immutable[key] = this.getForMutationMethod(key as any) as any;
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
        this.mutable[parentInfo.key as keyof M] as Mutable<any, any>
      ).mutationHelper.markDirty([
        parentInfo.dirtyKey as string,
        this.mutable[parentInfo.secondaryKey as keyof M] as any,
      ]);
    } else {
      (
        this.mutable[parentInfo.key as keyof M] as Mutable<any, any>
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

  getForMutationMethod(key: any): (...args: any[]) => I {
    return function (this: I, ...args: any[]): I {
      // @ts-ignore
      this._mutable[key].apply(this._mutable, args);
      return this._mutable.mutationHelper.getImmutable();
    };
  }
}
