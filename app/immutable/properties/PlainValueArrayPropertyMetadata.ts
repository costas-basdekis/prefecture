import { Mutable } from "../Mutable";
import { trackedProperty } from "./metadataMaker";
import { TrackedPropertyMetadata } from "./TrackedPropertyMetadata";

declare module "./TrackedPropertyMetadata" {
  interface MutationTypeDefinitions {
    plainValueArray: "plainValueArray";
  }
}

@trackedProperty("plainValueArray")
export class PlainValueArrayPropertyMetadata extends TrackedPropertyMetadata<"plainValueArray"> {
  makeMutableProxy(value: any, mutable: Mutable<any, any>) {
    const propertySelf = this;
    return new Proxy(value, {
      set(target, property, subValue, receiver) {
        mutable.mutationHelper.markDirty(propertySelf.key);
        return Reflect.set(target, property, subValue, receiver);
      },
      deleteProperty(target, property) {
        mutable.mutationHelper.markDirty(propertySelf.key);
        return Reflect.deleteProperty(target, property);
      },
    });
  }

  getImmutable(mutable: Mutable<any, any>) {
    return Array.from(this.getValue<any[]>(mutable));
  }
}
