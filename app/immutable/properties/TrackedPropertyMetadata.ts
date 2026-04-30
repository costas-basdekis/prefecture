import { unreachableCase } from "~/utils";
import { type Mutable } from "../Mutable";
import { type DirtyKeys } from "../MutationHelper";

export type MutationType =
  | "mutable"
  | "mutableMap"
  | "plainValue"
  | "plainValueArray"
  | "plainValueMap"
  | "plainValueById";

export type TrackedPropertyConfig<T extends MutationType> =
  T extends "plainValueById"
    ? { idKey: string | symbol; idPropertyKey: string | symbol }
    : null;

export class TrackedPropertyMetadata<T extends MutationType> {
  key: string | symbol;
  type: T;
  mutable: boolean;
  config: TrackedPropertyConfig<T>;
  mutableStore: WeakMap<Object, { value: any; proxy: any }>;

  constructor(
    key: string | symbol,
    type: T,
    mutable: boolean,
    config: TrackedPropertyConfig<T>,
  ) {
    this.key = key;
    this.type = type;
    this.mutable = mutable;
    this.config = config;
    this.mutableStore = new WeakMap();
  }

  addProperties(target: Object) {
    Object.defineProperty(target, this.key, this.makeMutableProperty());
    if (this.type === "plainValueById") {
      const propertySelf = this as TrackedPropertyMetadata<"plainValueById">;
      Object.defineProperty(target, propertySelf.config.idPropertyKey, {
        get: function (this: Mutable<any, any>) {
          const mainValue = this[propertySelf.key as keyof typeof this] as any;
          if (!mainValue) {
            return null;
          }
          return mainValue[propertySelf.config.idKey];
        },
      });
    }
  }

  makeMutableProperty(): PropertyDescriptor {
    const propertySelf = this;
    const store = this.mutableStore;
    const descriptor: PropertyDescriptor = {
      configurable: true,
      get: function (this: Mutable<any, any>) {
        return store.get(this)!.proxy;
      },
    };
    if (this.mutable) {
      descriptor.set = function (this: Mutable<any, any>, value) {
        const previousInfo = store.get(this);
        if (value === previousInfo?.value) {
          return;
        }
        let info = {
          value,
          proxy: propertySelf.makeMutableProxy(value, this),
        };
        store.set(this, info);
        if (this.mutationHelper) {
          propertySelf.markDirty(this, value);
        }
      };
    }
    return descriptor;
  }

  markDirty(mutable: Mutable<any, any>, value: any) {
    switch (this.type) {
      case "mutableMap":
        mutable.mutationHelper.markDirty(this.key);
        const previousInfo = this.mutableStore.get(this);
        if (previousInfo) {
          mutable.mutationHelper.markDirty(
            ...Object.keys(previousInfo.value).map(
              (key) => [this.key, key] as [string | symbol, string | number],
            ),
          );
        }
        mutable.mutationHelper.markDirty(
          ...Object.keys(value).map(
            (key) => [this.key, key] as [string | symbol, string | number],
          ),
        );
        break;
      case "plainValue":
      case "mutable":
      case "plainValueArray":
      case "plainValueMap":
      case "plainValueById":
        mutable.mutationHelper.markDirty(this.key);
        break;
      default:
        throw unreachableCase(this.type, `Unknown mutable type: ${this.type}`);
    }
  }

  makeMutableProxy(value: any, mutable: Mutable<any, any>): any {
    const propertySelf = this;
    switch (this.type) {
      case "plainValue":
      case "mutable":
      case "plainValueById":
        return value;
      case "mutableMap":
      case "plainValueArray":
      case "plainValueMap":
        return new Proxy(value, {
          set(target, property, subValue, receiver) {
            if (propertySelf.type === "mutableMap") {
              mutable.mutationHelper.markDirty([
                propertySelf.key,
                property as string,
              ]);
            } else {
              mutable.mutationHelper.markDirty(propertySelf.key);
            }
            return Reflect.set(target, property, subValue, receiver);
          },
          deleteProperty(target, property) {
            if (propertySelf.type === "mutableMap") {
              mutable.mutationHelper.markDirty([
                propertySelf.key,
                property as string,
              ]);
            } else {
              mutable.mutationHelper.markDirty(propertySelf.key);
            }
            return Reflect.deleteProperty(target, property);
          },
        });
      default:
        throw unreachableCase(this.type, `Unknown mutable type: ${this.type}`);
    }
  }

  getInitialDirtyKey(): boolean | Set<string | number> {
    switch (this.type) {
      case "mutable":
      case "plainValue":
      case "plainValueArray":
      case "plainValueMap":
        return false;
      case "plainValueById":
        return false;
      case "mutableMap":
        return new Set();
      default:
        throw unreachableCase(
          this.type,
          `Unknown mutation type "${this.type}" for ${this.mutable.constructor.name}.${this.key.toString()}`,
        );
    }
  }

  addInitialToImmutable(mutable: Mutable<any, any>, immutable: any) {
    switch (this.type) {
      case "mutable":
        immutable[this.key] = this.getImmutableForMutable(mutable);
        break;
      case "mutableMap":
        immutable[this.key] = this.getImmutableForMutableMap(mutable);
        break;
      case "plainValue":
        immutable[this.key] = this.getImmutableForPlainValue(mutable);
        break;
      case "plainValueArray":
        immutable[this.key] = this.getImmutableForPlainValueArray(mutable);
        break;
      case "plainValueMap":
        immutable[this.key] = this.getImmutableForPlainValueMap(mutable);
        break;
      case "plainValueById":
        immutable[this.config!.idPropertyKey] =
          this.getImmutableForPlainValueById(mutable);
        break;
      default:
        throw unreachableCase(
          this.type,
          `Unknown mutation type "${this.type}" for ${this.mutable.constructor.name}.${this.key.toString()}`,
        );
    }
  }

  getValue<T = any>(mutable: Mutable<any, any>): T {
    // @ts-ignore
    return mutable[this.key];
  }

  getImmutableForMutable(mutable: Mutable<any, any>): any {
    return this.getValue<Mutable<any, any>>(
      mutable,
    ).mutationHelper.getImmutable();
  }

  getImmutableForMutableMap(
    mutable: Mutable<any, any>,
    mappedKeys?: Set<string | symbol | number>,
  ): Object {
    if (mappedKeys) {
      return Object.fromEntries(
        Array.from(mappedKeys).map((mappedKey) => {
          const subValue = this.getValue(mutable)[mappedKey];
          return [
            mappedKey,
            subValue ? subValue.mutationHelper.getImmutable() : undefined,
          ];
        }),
      );
    } else {
      return Object.fromEntries(
        Object.entries(
          this.getValue<Record<any, Mutable<any, any>>>(mutable),
        ).map(([key, value]) => [key, value.mutationHelper.getImmutable()]),
      );
    }
  }

  getImmutableForPlainValue(mutable: Mutable<any, any>): any {
    return this.getValue(mutable);
  }

  getImmutableForPlainValueArray(mutable: Mutable<any, any>): any[] {
    return Array.from(this.getValue<any[]>(mutable)) as any;
  }

  getImmutableForPlainValueMap(mutable: Mutable<any, any>): Object {
    return { ...this.getValue<Object>(mutable) };
  }

  getImmutableForPlainValueById(mutable: Mutable<any, any>): any {
    return this.getValue(mutable)?.[this.config!.idKey] ?? null;
  }

  updateImmutable(
    mutable: Mutable<any, any>,
    immutable: any,
    dirtyKeys: DirtyKeys,
  ) {
    const mutationType: MutationType = this.type;
    switch (mutationType) {
      case "mutable":
        this.updateForMutable(mutable, immutable, dirtyKeys);
        break;
      case "mutableMap":
        this.updateForMutableMap(mutable, immutable, dirtyKeys);
        break;
      case "plainValue":
        this.updateForPlainValue(mutable, immutable, dirtyKeys);
        break;
      case "plainValueArray":
        this.updateForPlainValueArray(mutable, immutable, dirtyKeys);
        break;
      case "plainValueMap":
        this.updateForPlainValueMap(mutable, immutable, dirtyKeys);
        break;
      case "plainValueById":
        this.updateForPlainValueById(mutable, immutable, dirtyKeys);
        break;
      default:
        throw unreachableCase(
          mutationType,
          `Unknown mutation type "${mutationType}" for ${this.mutable.constructor.name}.${this.key.toString()}`,
        );
    }
  }

  updateForMutable(
    mutable: Mutable<any, any>,
    immutable: any,
    dirtyKeys: DirtyKeys,
  ) {
    if (dirtyKeys[this.key]) {
      immutable[this.key] = this.getImmutableForMutable(mutable);
      dirtyKeys[this.key] = false;
    }
  }

  updateForMutableMap(
    mutable: Mutable<any, any>,
    immutable: any,
    dirtyKeys: DirtyKeys,
  ) {
    const dirtyMappedKeys: Set<string | number> = dirtyKeys[this.key] as Set<
      string | number
    >;
    if (dirtyMappedKeys.size) {
      immutable[this.key] = {
        ...immutable[this.key],
        ...this.getImmutableForMutableMap(mutable, dirtyMappedKeys),
      };
      for (const mappedKey of dirtyMappedKeys) {
        if (immutable[this.key][mappedKey] === undefined) {
          delete immutable[this.key][mappedKey];
        }
      }
      dirtyMappedKeys.clear();
    }
  }

  updateForPlainValue(
    mutable: Mutable<any, any>,
    immutable: any,
    dirtyKeys: DirtyKeys,
  ) {
    if (dirtyKeys[this.key]) {
      immutable[this.key] = this.getImmutableForPlainValue(mutable);
      dirtyKeys[this.key] = false;
    }
  }

  updateForPlainValueArray(
    mutable: Mutable<any, any>,
    immutable: any,
    dirtyKeys: DirtyKeys,
  ) {
    if (dirtyKeys[this.key]) {
      immutable[this.key] = this.getImmutableForPlainValueArray(mutable);
      dirtyKeys[this.key] = false;
    }
  }

  updateForPlainValueMap(
    mutable: Mutable<any, any>,
    immutable: any,
    dirtyKeys: DirtyKeys,
  ) {
    if (dirtyKeys[this.key]) {
      immutable[this.key] = this.getImmutableForPlainValueMap(mutable);
      dirtyKeys[this.key] = false;
    }
  }

  updateForPlainValueById(
    mutable: Mutable<any, any>,
    immutable: any,
    dirtyKeys: DirtyKeys,
  ) {
    if (dirtyKeys[this.key]) {
      immutable[this.config!.idPropertyKey] =
        this.getImmutableForPlainValueById(mutable);
      dirtyKeys[this.key] = false;
    }
  }
}
