import "reflect-metadata";
import { Immutable } from "./Immutable";
import { Mutable } from "./Mutable";
import { unreachableCase } from "~/utils";
import {
  MutableMetadata,
  MutablePropertyMetadata,
  MutationType,
} from "./MutableMetadata";

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

export function immutable(target: Object, propertyKey: string | symbol) {
  const metadata = MutableMetadata.getOrSet(target);
  if (metadata.keysWithNoMutation.has(propertyKey)) {
    throw new Error(
      `Immutable key was already defined (${propertyKey.toString()}) for ${target}`,
    );
  }
  if (metadata.mutableMap.has(propertyKey)) {
    throw new Error(
      `Immutable key was already defined (${propertyKey.toString()}) as mutable for ${target}`,
    );
  }
  metadata.keysWithNoMutation.add(propertyKey);
}

const mutableStoreMap = new Map<string | symbol, WeakMap<Object, any>>();
function getMutableStore(propertyKey: string | symbol): WeakMap<Object, any> {
  let store = mutableStoreMap.get(propertyKey);
  if (!store) {
    store = new WeakMap();
    mutableStoreMap.set(propertyKey, store);
  }
  return store;
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
    const metadata = MutableMetadata.getOrSet(target);
    if (metadata.mutableMap.has(propertyKey)) {
      throw new Error(
        `Mutable key was already defined (${propertyKey.toString()}) for ${target}`,
      );
    }
    if (metadata.keysWithNoMutation?.has(propertyKey)) {
      throw new Error(
        `Mutable key was already defined (${propertyKey.toString()}) as immutable for ${target}`,
      );
    }
    if (type === "plainValueById") {
      if (idKey === undefined) {
        idKey = "id";
      }
      const descriptor: PropertyDescriptor = {
        get: function (this: any) {
          if (!this[propertyKey]) {
            return null;
          }
          return this[propertyKey][idKey];
        },
      };
      if (idPropertyKey === undefined) {
        idPropertyKey = `${propertyKey.toString()}Id`;
      }
      metadata.mutableMap.set(
        propertyKey,
        new MutablePropertyMetadata(propertyKey, type, {
          idKey,
          idPropertyKey,
        }),
      );
      Object.defineProperty(target, idPropertyKey, descriptor);
    } else {
      metadata.mutableMap.set(
        propertyKey,
        new MutablePropertyMetadata(propertyKey, type, null),
      );
    }

    Object.defineProperty(
      target,
      propertyKey,
      makeMutableProperty(type, propertyKey),
    );
  };
}

function makeMutableProperty(
  type: MutationType,
  propertyKey: string | symbol,
): PropertyDescriptor {
  const store = getMutableStore(propertyKey);
  return {
    configurable: true,
    get: function () {
      return store.get(this).proxy;
    },
    set: function (value) {
      const previousInfo = store.get(this);
      if (value === previousInfo?.value) {
        return;
      }
      const self = this as Mutable<any, any>;
      let info = {
        value,
        proxy: makeMutableProxy(value, type, propertyKey, self),
      };
      store.set(this, info);
      if (self.mutationHelper) {
        switch (type) {
          case "mutableMap":
            self.mutationHelper.markDirty(propertyKey);
            if (previousInfo) {
              (this as Mutable<any, any>).mutationHelper.markDirty(
                ...Object.keys(previousInfo.value).map(
                  (key) =>
                    [propertyKey, key] as [string | symbol, string | number],
                ),
              );
            }
            (this as Mutable<any, any>).mutationHelper.markDirty(
              ...Object.keys(value).map(
                (key) =>
                  [propertyKey, key] as [string | symbol, string | number],
              ),
            );
            break;
          case "plainValue":
          case "mutable":
          case "plainValueArray":
          case "plainValueMap":
          case "plainValueById":
            self.mutationHelper.markDirty(propertyKey);
            break;
          default:
            throw unreachableCase(type, `Unknown mutable type: ${type}`);
        }
      }
    },
  };
}

function makeMutableProxy(
  value: any,
  type: MutationType,
  propertyKey: string | symbol,
  self: any,
): any {
  switch (type) {
    case "plainValue":
    case "mutable":
    case "plainValueById":
      return value;
    case "mutableMap":
    case "plainValueArray":
    case "plainValueMap":
      return new Proxy(value, {
        set(target, property, subValue, receiver) {
          if (type === "mutableMap") {
            self.mutationHelper.markDirty([propertyKey, property as string]);
          } else {
            self.mutationHelper.markDirty(propertyKey);
          }
          return Reflect.set(target, property, subValue, receiver);
        },
        deleteProperty(target, property) {
          if (type === "mutableMap") {
            self.mutationHelper.markDirty([propertyKey, property as string]);
          } else {
            self.mutationHelper.markDirty(propertyKey);
          }
          return Reflect.deleteProperty(target, property);
        },
      });
    default:
      throw unreachableCase(type, `Unknown mutable type: ${type}`);
  }
}

export function methodMutate(target: Object, propertyKey: string | symbol) {
  const metadata = MutableMetadata.getOrSet(target);
  metadata.keysWithMethodMutationType.add(propertyKey);
}

export function parentKey(dirtyKey: string) {
  return function (target: Object, propertyKey: string | symbol) {
    const metadata = MutableMetadata.getOrSet(target);
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
  const metadata = MutableMetadata.getOrSet(target);
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
    return this.getDefaultInitialDirtyKeys();
  }

  getDefaultInitialDirtyKeys(): DirtyKeys {
    const dirtyKeys: Partial<DirtyKeys> = {};
    const metadata = MutableMetadata.get(this.mutable);
    for (const property of metadata.mutableMap.values()) {
      const mutationType: MutationType = property.type;
      switch (mutationType) {
        case "mutable":
        case "plainValue":
        case "plainValueArray":
        case "plainValueMap":
          dirtyKeys[property.key] = false;
          break;
        case "plainValueById":
          dirtyKeys[property.key] = false;
          break;
        case "mutableMap":
          dirtyKeys[property.key] = new Set();
          break;
        default:
          throw unreachableCase(
            mutationType,
            `Unknown mutation type "${mutationType}" for ${this.mutable.constructor.name}.${property.key.toString()}`,
          );
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
    const metadata = MutableMetadata.get(this.mutable);
    for (const key of metadata.keysWithNoMutation) {
      // @ts-ignore
      immutable[key] = this.mutable[key];
    }
    for (const property of metadata.mutableMap.values()) {
      const mutationType: MutationType = property.type;
      switch (mutationType) {
        case "mutable":
          immutable[property.key as keyof I] = this.getForMutable(
            property.key as any,
          );
          break;
        case "mutableMap":
          immutable[property.key as keyof I] = this.getForMutableMap(
            property.key as any,
          ) as any;
          break;
        case "plainValue":
          immutable[property.key as keyof I] = this.getForPlainValue(
            property.key as any,
          );
          break;
        case "plainValueArray":
          immutable[property.key as keyof I] = this.getForPlainValueArray(
            property.key as any,
          );
          break;
        case "plainValueMap":
          immutable[property.key as keyof I] = this.getForPlainValueMap(
            property.key as any,
          );
          break;
        case "plainValueById":
          immutable[property.config!.idPropertyKey as keyof I] =
            this.getForPlainValueById(
              property.key as any,
              property.config!.idKey,
            );
          break;
        default:
          throw unreachableCase(
            mutationType,
            `Unknown mutation type "${mutationType}" for ${this.mutable.constructor.name}.${property.key.toString()}`,
          );
      }
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
    const metadata = MutableMetadata.get(this.mutable);
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
          `Dirty key "${key}" of ${this.constructor.name} is not a set`,
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
    const metadata = MutableMetadata.get(this.mutable);
    for (const property of metadata.mutableMap.values()) {
      const mutationType: MutationType = property.type;
      switch (mutationType) {
        case "mutable":
          this.updateForMutable(property.key as any);
          break;
        case "mutableMap":
          this.updateForMutableMap(property.key as any);
          break;
        case "plainValue":
          this.updateForPlainValue(property.key as any);
          break;
        case "plainValueArray":
          this.updateForPlainValueArray(property.key as any);
          break;
        case "plainValueMap":
          this.updateForPlainValueMap(property.key as any);
          break;
        case "plainValueById":
          this.updateForPlainValueById(
            property.key as any,
            property.config!.idKey,
          );
          break;
        default:
          throw unreachableCase(
            mutationType,
            `Unknown mutation type "${mutationType}" for ${this.mutable.constructor.name}.${property.key.toString()}`,
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

  getForPlainValueArray<K extends keyof M>(key: K): M[K] {
    return Array.from(this.mutable[key] as any[]) as any;
  }

  updateForPlainValueArray(key: string) {
    if (typeof this.dirtyKeys[key] !== "boolean") {
      throw new Error(
        `Dirty key "${key.toString()}" for ${this.constructor.name} is not a boolean`,
      );
    }
    if (this.dirtyKeys[key]) {
      // @ts-ignore
      this.lastImmutable[key] = this.getForPlainValueArray(key);
      this.dirtyKeys[key] = false;
    }
  }

  getForPlainValueMap<K extends keyof M>(key: K): M[K] {
    return { ...this.mutable[key] };
  }

  updateForPlainValueMap(key: string) {
    if (typeof this.dirtyKeys[key] !== "boolean") {
      throw new Error(
        `Dirty key "${key.toString()}" for ${this.constructor.name} is not a boolean`,
      );
    }
    if (this.dirtyKeys[key]) {
      // @ts-ignore
      this.lastImmutable[key] = this.getForPlainValueMap(key);
      this.dirtyKeys[key] = false;
    }
  }

  getForMutableMap<
    MK extends (string | number) & keyof M[K],
    K extends MappedMutableDirtyKeys<M, I>,
  >(key: K, mappedKeys?: Set<MK>): Record<MK, any> {
    if (mappedKeys) {
      // @ts-ignore
      return Object.fromEntries(
        Array.from(mappedKeys).map((mappedKey) => [
          mappedKey,
          this.mutable[key][mappedKey]
            ? // @ts-ignore
              this.mutable[key][mappedKey].mutationHelper.getImmutable()
            : undefined,
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

  updateForMutableMap<
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
        ...this.getForMutableMap(key, dirtyMappedKeys),
      };
      for (const mappedKey of dirtyMappedKeys) {
        // @ts-ignore
        if (this.lastImmutable[key][mappedKey] === undefined) {
          // @ts-ignore
          delete this.lastImmutable[key][mappedKey];
        }
      }
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

  updateForPlainValueById(key: string, idKey: string | symbol) {
    if (typeof this.dirtyKeys[key] !== "boolean") {
      throw new Error(
        `Dirty key "${key.toString()}" for ${this.constructor.name} is not a boolean`,
      );
    }
    if (this.dirtyKeys[key]) {
      const metadata = MutableMetadata.get(this.mutable);
      const property = metadata.mutableMap.get(
        key,
      ) as MutablePropertyMetadata<"plainValueById">;
      // @ts-ignore
      this.lastImmutable[property.config.idPropertyKey] =
        this.getForPlainValueById(key as keyof M, idKey);
      this.dirtyKeys[key] = false;
    }
  }

  getForPlainValueById<K extends keyof M>(key: K, idKey: string | symbol): any {
    return (this.mutable[key] as any)?.[idKey] ?? null;
  }
}
