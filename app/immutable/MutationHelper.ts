import "reflect-metadata";
import { Immutable } from "./Immutable";
import { Mutable } from "./Mutable";

export type MutableDirtyKeys<M, I, DK> = keyof {
  [key in keyof M & keyof I & DK as M[key] extends Mutable<any, infer I1>
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
const keysWithMutationTypeKey = Symbol("keysWithMutationType");
const keysWithMethodMutationTypeKey = Symbol("keysWithMethodMutationType");
const mutationTypeKey = Symbol("mutationType");

export function immutable(target: Object, propertyKey: string | symbol) {
  const keys: Set<string | symbol> =
    Reflect.getMetadata(keysWithNoMutationKey, target) ??
    new Set<string | symbol>();
  keys.add(propertyKey);
  Reflect.defineMetadata(keysWithNoMutationKey, keys, target);
}

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

export function methodMutate(target: Object, propertyKey: string | symbol) {
  const keys: Set<string | symbol> =
    Reflect.getMetadata(keysWithMethodMutationTypeKey, target) ??
    new Set<string | symbol>();
  keys.add(propertyKey);
  Reflect.defineMetadata(keysWithMethodMutationTypeKey, keys, target);
}

export class MutationHelper<
  M extends Mutable<M, I>,
  I extends Immutable<M>,
  DKO,
  DK = keyof DKO,
> {
  mutable: M;
  dirty: boolean;
  dirtyKeys: DKO;
  lastImmutable: I;

  constructor(mutable: M) {
    this.mutable = mutable;
    this.dirty = false;
    this.dirtyKeys = this.getInitialDirtyKeys();
    this.lastImmutable = this.getInitialImmutable();
  }

  getInitialDirtyKeys(): DKO {
    return this.getDefaultInitialDirtyKeys();
  }

  getDefaultInitialDirtyKeys(): this["dirtyKeys"] {
    const dirtyKeys: Partial<this["dirtyKeys"]> = {};
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

  getInitialImmutable(): I {
    return {
      ...this.getDefaultInitialImmutable(),
      ...this.getExtraInitialImmutable(),
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

  getExtraInitialImmutable(): Partial<I> {
    return {};
  }

  markDirty(...keys: DK[]) {
    for (const key of keys) {
      this.markKeyDirty(key);
    }
    this.dirty = true;
  }

  markKeyDirty(key: DK) {
    if (Array.isArray(key)) {
      const [actualKey, secondaryKey] = key;

      const dirtyKeyValue = this.dirtyKeys[actualKey as unknown as keyof DKO];
      if (!(dirtyKeyValue instanceof Set)) {
        throw new Error(
          `Dirty key "${key}" of ${this.constructor.name} is not a set`,
        );
      }
      dirtyKeyValue.add(secondaryKey);
      return;
    }
    const dirtyKeyValue = this.dirtyKeys[key as unknown as keyof DKO];
    if (typeof dirtyKeyValue !== "boolean") {
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

  getForMutable<K extends MutableDirtyKeys<M, I, DK>>(key: K): I[K] {
    return (this.mutable[key] as Mutable<any, any>).getImmutable();
  }

  updateForMutable(key: MutableDirtyKeys<M, I, DK>) {
    const dkoKey = key as any as keyof DKO;
    if (typeof this.dirtyKeys[dkoKey] !== "boolean") {
      throw new Error(
        `Dirty key "${key.toString()}" for ${this.constructor.name} is not a boolean`,
      );
    }
    if (this.dirtyKeys[dkoKey]) {
      this.lastImmutable[key] = this.getForMutable(key);
      this.dirtyKeys[dkoKey] = false as DKO[typeof dkoKey];
    }
  }

  getForPlainValue<K extends DK & keyof M>(key: K): M[K] {
    return this.mutable[key];
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
      this.lastImmutable[key] = this.getForPlainValue(key);
      this.dirtyKeys[dkoKey] = false as DKO[typeof dkoKey];
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
          this.mutable[key][mappedKey].getImmutable(),
        ]),
      );
    } else {
      // @ts-ignore
      return Object.fromEntries(
        // @ts-ignore
        Object.entries(this.mutable[key]).map(([key, value]) => [
          key,
          // @ts-ignore
          value.getImmutable(),
        ]),
      );
    }
  }

  updateForMappedMutable<
    MK extends (string | number) & keyof M[K],
    K extends MappedMutableDirtyKeys<M, I>,
  >(key: K) {
    const dkoKey = key as any as keyof DKO;
    if (!(this.dirtyKeys[dkoKey] instanceof Set)) {
      throw new Error(
        `Dirty key "${dkoKey.toString()}" for ${this.constructor.name} is not a set`,
      );
    }
    const dirtyMappedKeys: Set<MK> = this.dirtyKeys[dkoKey];
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
