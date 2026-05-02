import { type Mutable } from "../Mutable";
import { type DirtyKeys } from "../MutationHelper";

export interface MutationTypeDefinitions {}

export type MutationType =
  MutationTypeDefinitions[keyof MutationTypeDefinitions];

export type TrackedPropertyConfig<T extends MutationType> =
  T extends "plainValueById"
    ? { idKey: string | symbol; idPropertyKey: string | symbol }
    : null;

export abstract class TrackedPropertyMetadata<T extends MutationType> {
  key: string | symbol;
  type: T;
  mutable: boolean;
  config: TrackedPropertyConfig<T>;
  mutableStore: WeakMap<Mutable<any, any>, { value: any; proxy: any }>;

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
    if (this.mutable) {
      Object.defineProperty(target, this.key, this.makeMutableProperty());
    }
  }

  makeMutableProperty(): PropertyDescriptor {
    const propertySelf = this;
    const store = this.mutableStore;
    return {
      configurable: true,
      get: function (this: Mutable<any, any>) {
        return store.get(this)!.proxy;
      },
      set: function (this: Mutable<any, any>, value) {
        const previousInfo = store.get(this);
        if (value === previousInfo?.value) {
          return;
        }
        store.set(this, {
          value,
          proxy: propertySelf.makeMutableProxy(value, this),
        });
        // There won't be a mutable helper before the end of constructor
        if (this.mutationHelper) {
          propertySelf.markDirty(this, value);
        }
      },
    };
  }

  markDirty(mutable: Mutable<any, any>, _value: any) {
    mutable.mutationHelper.markDirty(this.key);
  }

  makeMutableProxy(value: any, mutable: Mutable<any, any>): any {
    return value;
  }

  getInitialDirtyKey(): boolean | Set<string | number> {
    return false;
  }

  addInitialToImmutable(mutable: Mutable<any, any>, immutable: any) {
    immutable[this.key] = this.getImmutable(mutable);
  }

  getValue<T = any>(mutable: Mutable<any, any>): T {
    // @ts-ignore
    return mutable[this.key];
  }

  abstract getImmutable(mutable: Mutable<any, any>): any;

  updateImmutable(
    mutable: Mutable<any, any>,
    immutable: any,
    dirtyKeys: DirtyKeys,
  ): void {
    if (dirtyKeys[this.key]) {
      immutable[this.key] = this.getImmutable(mutable);
      if (typeof dirtyKeys[this.key] === "boolean") {
        dirtyKeys[this.key] = false;
      } else {
        (dirtyKeys[this.key] as Set<any>).clear();
      }
    }
  }
}
