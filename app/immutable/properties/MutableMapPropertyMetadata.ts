import { Mutable } from "../Mutable";
import { trackedProperty } from "./metadataMaker";
import { TrackedPropertyMetadata } from "./TrackedPropertyMetadata";

declare module "./TrackedPropertyMetadata" {
  interface MutationTypeDefinitions {
    mutableMap: "mutableMap";
  }
}

@trackedProperty("mutableMap")
export class MutableMapPropertyMetadata extends TrackedPropertyMetadata<"mutableMap"> {
  getInitialDirtyKey(): boolean | Set<string | number> {
    return new Set();
  }

  markDirty(mutable: Mutable<any, any>, value: any): void {
    mutable.mutationHelper.markDirty(this.key);
    const previousInfo = this.mutableStore.get(mutable);
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
  }

  makeMutableProxy(value: any, mutable: Mutable<any, any>): any {
    const propertySelf = this;
    return new Proxy(value, {
      set(target, property, subValue, receiver) {
        mutable.mutationHelper.markDirty([
          propertySelf.key,
          property as string,
        ]);
        return Reflect.set(target, property, subValue, receiver);
      },
      deleteProperty(target, property) {
        mutable.mutationHelper.markDirty([
          propertySelf.key,
          property as string,
        ]);
        return Reflect.deleteProperty(target, property);
      },
    });
  }

  getImmutable(
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
}
