import { Mutable } from "../Mutable";
import { DirtyKeys } from "../MutationHelper";
import { TrackedPropertyMetadata } from "./TrackedPropertyMetadata";

declare module "./TrackedPropertyMetadata" {
  interface MutationTypeDefinitions {
    plainValueById: "plainValueById";
  }
}

export class PlainValueByIdPropertyMetadata extends TrackedPropertyMetadata<"plainValueById"> {
  addProperties(target: Object) {
    super.addProperties(target);
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

  addInitialToImmutable(mutable: Mutable<any, any>, immutable: any): void {
    immutable[this.config!.idPropertyKey] = this.getImmutable(mutable);
  }

  getImmutable(mutable: Mutable<any, any>) {
    return this.getValue(mutable)?.[this.config!.idKey] ?? null;
  }

  updateImmutable(
    mutable: Mutable<any, any>,
    immutable: any,
    dirtyKeys: DirtyKeys,
  ): void {
    if (dirtyKeys[this.key]) {
      immutable[this.config!.idPropertyKey] = this.getImmutable(mutable);
      dirtyKeys[this.key] = false;
    }
  }
}
