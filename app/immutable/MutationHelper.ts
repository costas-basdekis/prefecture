import "reflect-metadata";
import { Immutable } from "./Immutable";
import { Mutable } from "./Mutable";

export type MutableDirtyKeys<M, I> = keyof {
  [key in keyof M & keyof I as M[key] extends Mutable<any, infer I1>
    ? I[key] extends I1
      ? key
      : never
    : never]: M[key];
};

export type MappedMutableDirtyKeys<M, I> = keyof {
  [key in keyof M & keyof I as M[key] extends Record<
    any,
    Mutable<any, infer I1>
  >
    ? I[key] extends Record<any, I1>
      ? key
      : never
    : never]: M[key];
};

export type MutableMutationMethodKeys<M, I> = keyof {
  [key in keyof M & keyof I as M[key] extends (
    ...args: infer A
  ) => Mutable<any, any>
    ? I[key] extends (...args: A) => any
      ? key
      : never
    : never]: M[key];
};

export type MutationType = "mutable" | "mappedMutable" | "plainValue";

const keysWithNoMutationKey = Symbol("keysWithNoMutation");

export function immutable(target: Object, propertyKey: string | symbol) {
  const keys: Set<string | symbol> =
    Reflect.getMetadata(keysWithNoMutationKey, target) ??
    new Set<string | symbol>();
  keys.add(propertyKey);
  Reflect.defineMetadata(keysWithNoMutationKey, keys, target);
}

const keysWithMutationTypeKey = Symbol("keysWithMutationType");
const mutationTypeKey = Symbol("mutationType");

export function mutate(type: MutationType) {
  return function (target: Object, propertyKey: string | symbol) {
    const keys: Set<string | symbol> =
      Reflect.getMetadata(keysWithMutationTypeKey, target) ??
      new Set<string | symbol>();
    keys.add(propertyKey);
    Reflect.defineMetadata(keysWithMutationTypeKey, keys, target);
    Reflect.defineMetadata(mutationTypeKey, type, target, propertyKey);
  };
}

const keysWithMethodMutationTypeKey = Symbol("keysWithMethodMutationType");

export function methodMutate(target: Object, propertyKey: string | symbol) {
  const keys: Set<string | symbol> =
    Reflect.getMetadata(keysWithMethodMutationTypeKey, target) ??
    new Set<string | symbol>();
  keys.add(propertyKey);
  Reflect.defineMetadata(keysWithMethodMutationTypeKey, keys, target);
}

const parentInfoKey = Symbol("parentInfo");

export function parent(dirtyKey: string) {
  return function (target: Object, propertyKey: string | symbol) {
    const existingParentInfo = Reflect.getMetadata(parentInfoKey, target);
    if (existingParentInfo) {
      throw new Error(
        `Parent key was already defined (${existingParentInfo.parentKey}) for ${target}`,
      );
    }
    Reflect.defineMetadata(
      parentInfoKey,
      { parentKey: propertyKey, dirtyKey },
      target,
    );
  };
}

const parentSecondaryKeyKey = Symbol("parentSecondaryKeyKey");

export function parentSecondaryKey(
  target: Object,
  propertyKey: string | symbol,
) {
  Reflect.defineMetadata(parentSecondaryKeyKey, propertyKey, target);
}

export type DirtyKeys = {
  [key: string]: boolean | Set<string | number>;
};

export type DirtyKey = string | [string, string | number];

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

  getInitialDirtyKeys(): DirtyKeys {
    return this.getDefaultInitialDirtyKeys();
  }

  getDefaultInitialDirtyKeys(): DirtyKeys {
    const dirtyKeys: Partial<DirtyKeys> = {};
    const keysWithMutationType: Set<keyof I> | undefined = Reflect.getMetadata(
      keysWithMutationTypeKey,
      this.mutable,
    );
    if (keysWithMutationType) {
      for (const key of keysWithMutationType) {
        const mutationType: MutationType = Reflect.getMetadata(
          mutationTypeKey,
          this.mutable,
          key as string | symbol,
        );
        switch (mutationType) {
          case "mutable":
          case "plainValue":
            // @ts-ignore
            dirtyKeys[key] = false;
            break;
          case "mappedMutable":
            // @ts-ignore
            dirtyKeys[key] = new Set();
            break;
          default:
            throw new Error(
              `Unknown mutation type "${mutationType}" for ${this.mutable.constructor.name}.${key.toString()}`,
            );
        }
      }
    }
    return dirtyKeys as this["dirtyKeys"];
  }

  getInitialImmutable(initialExtraImmutable?: Partial<I>): I {
    return {
      ...this.getDefaultInitialImmutable(),
      ...initialExtraImmutable,
    };
  }

  getDefaultInitialImmutable(): I {
    const immutable: Partial<I> = { _mutable: this.mutable } as Partial<I>;
    const keysWithNoMutation: Set<keyof I> | undefined = Reflect.getMetadata(
      keysWithNoMutationKey,
      this.mutable,
    );
    if (keysWithNoMutation) {
      for (const key of keysWithNoMutation) {
        // @ts-ignore
        immutable[key] = this.mutable[key];
      }
    }
    const keysWithMutationType: Set<keyof I> | undefined = Reflect.getMetadata(
      keysWithMutationTypeKey,
      this.mutable,
    );
    if (keysWithMutationType) {
      for (const key of keysWithMutationType) {
        const mutationType: MutationType = Reflect.getMetadata(
          mutationTypeKey,
          this.mutable,
          key as string | symbol,
        );
        switch (mutationType) {
          case "mutable":
            immutable[key] = this.getForMutable(key as any);
            break;
          case "mappedMutable":
            immutable[key] = this.getForMappedMutable(key as any) as any;
            break;
          case "plainValue":
            immutable[key] = this.getForPlainValue(key as any);
            break;
          default:
            throw new Error(
              `Unknown mutation type "${mutationType}" for ${this.mutable.constructor.name}.${key.toString()}`,
            );
        }
      }
    }
    const keysWithMethodMutation: Set<keyof I> | undefined =
      Reflect.getMetadata(keysWithMethodMutationTypeKey, this.mutable);
    if (keysWithMethodMutation) {
      for (const key of keysWithMethodMutation) {
        immutable[key] = this.getForMutationMethod(key as any) as any;
      }
    }
    return immutable as I;
  }

  markDirty(...keys: DirtyKey[]) {
    for (const key of keys) {
      this.markKeyDirty(key);
    }
    this.dirty = true;
    this.markParentDirty();
  }

  parentKey?: keyof M;
  parentDirtyKey?: string;
  parentSecondaryDirtyKey?: (mutable: M) => string | number;

  markParentDirty() {
    if (!this.parentKey) {
      const parentInfo = Reflect.getMetadata(parentInfoKey, this.mutable);
      if (!parentInfo) {
        return;
      }
      this.parentKey = parentInfo.parentKey as keyof M;
      this.parentDirtyKey = parentInfo.dirtyKey as string;
    }
    if (!this.parentSecondaryDirtyKey) {
      const parentSecondaryKey = Reflect.getMetadata(
        parentSecondaryKeyKey,
        this.mutable,
      );
      if (parentSecondaryKey) {
        this.parentSecondaryDirtyKey = (mutable) =>
          mutable[parentSecondaryKey as keyof M] as any;
      }
    }
    if (this.parentSecondaryDirtyKey) {
      (
        this.mutable[this.parentKey] as Mutable<any, any>
      ).mutationHelper.markDirty([
        this.parentDirtyKey as string,
        this.parentSecondaryDirtyKey(this.mutable),
      ]);
    } else {
      (
        this.mutable[this.parentKey] as Mutable<any, any>
      ).mutationHelper.markDirty(this.parentDirtyKey as string);
    }
  }

  markKeyDirty(key: DirtyKey) {
    if (Array.isArray(key)) {
      const [actualKey, secondaryKey] = key;

      const dirtyKeyValue = this.dirtyKeys[actualKey];
      if (!(dirtyKeyValue instanceof Set)) {
        throw new Error(
          `Dirty key "${key}" of ${this.constructor.name} is not a set`,
        );
      }
      dirtyKeyValue.add(secondaryKey);
      return;
    }
    const dirtyKeyValue = this.dirtyKeys[key];
    if (typeof dirtyKeyValue !== "boolean") {
      throw new Error(
        `Dirty key "${key}" of ${this.constructor.name} is not a boolean`,
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
    const keys: Set<string | symbol> | undefined = Reflect.getMetadata(
      keysWithMutationTypeKey,
      this.mutable,
    );
    if (!keys) {
      throw new Error(
        `Not implemented ${this.constructor.name}.updateImmutableDirtyKeys`,
      );
    }
    for (const key of keys) {
      const mutationType: MutationType = Reflect.getMetadata(
        mutationTypeKey,
        this.mutable,
        key,
      );
      switch (mutationType) {
        case "mutable":
          this.updateForMutable(key as any);
          break;
        case "mappedMutable":
          this.updateForMappedMutable(key as never);
          break;
        case "plainValue":
          this.updateForPlainValue(key as any);
          break;
        default:
          throw new Error(
            `Unknown mutation type "${mutationType}" for ${this.mutable.constructor.name}.${key.toString()}`,
          );
      }
    }
  }

  getForMutable<K extends MutableDirtyKeys<M, I>>(key: K): I[K] {
    return (
      this.mutable[key] as Mutable<any, any>
    ).mutationHelper.getImmutable();
  }

  updateForMutable(key: MutableDirtyKeys<M, I>) {
    if (typeof this.dirtyKeys[key as any] !== "boolean") {
      throw new Error(
        `Dirty key "${key.toString()}" for ${this.constructor.name} is not a boolean`,
      );
    }
    if (this.dirtyKeys[key as any]) {
      this.lastImmutable[key] = this.getForMutable(key);
      this.dirtyKeys[key as any] = false;
    }
  }

  getForPlainValue<K extends keyof M>(key: K): M[K] {
    return this.mutable[key];
  }

  updateForPlainValue(key: string) {
    if (typeof this.dirtyKeys[key] !== "boolean") {
      throw new Error(
        `Dirty key "${key.toString()}" for ${this.constructor.name} is not a boolean`,
      );
    }
    if (this.dirtyKeys[key]) {
      // @ts-ignore
      this.lastImmutable[key] = this.getForPlainValue(key);
      this.dirtyKeys[key] = false;
    }
  }

  getForMappedMutable<
    MK extends (string | number) & keyof M[K],
    K extends MappedMutableDirtyKeys<M, I>,
  >(key: K, mappedKeys?: Set<MK>): Record<MK, any> {
    if (mappedKeys) {
      // @ts-ignore
      return Object.fromEntries(
        Array.from(mappedKeys).map((mappedKey) => [
          mappedKey,
          // @ts-ignore
          this.mutable[key][mappedKey].mutationHelper.getImmutable(),
        ]),
      );
    } else {
      // @ts-ignore
      return Object.fromEntries(
        // @ts-ignore
        Object.entries(this.mutable[key]).map(([key, value]) => [
          key,
          // @ts-ignore
          value.mutationHelper.getImmutable(),
        ]),
      );
    }
  }

  updateForMappedMutable<
    MK extends (string | number) & keyof M[K],
    K extends MappedMutableDirtyKeys<M, I>,
  >(key: K) {
    if (!(this.dirtyKeys[key as any] instanceof Set)) {
      throw new Error(
        `Dirty key "${key.toString()}" for ${this.constructor.name} is not a set`,
      );
    }
    const dirtyMappedKeys: Set<MK> = this.dirtyKeys[key] as Set<MK>;
    if (dirtyMappedKeys.size) {
      this.lastImmutable[key] = {
        ...this.lastImmutable[key],
        ...this.getForMappedMutable(key, dirtyMappedKeys),
      };
      dirtyMappedKeys.clear();
    }
  }

  getForMutationMethod<K extends MutableMutationMethodKeys<M, I>>(
    key: K,
    // @ts-ignore
  ): (...args: Parameters<M[K]>) => I {
    // @ts-ignore
    return function (this: I, ...args: Parameters<M[K]>): I {
      // @ts-ignore
      this._mutable[key].apply(this._mutable, args);
      return this._mutable.mutationHelper.getImmutable();
    };
  }
}
