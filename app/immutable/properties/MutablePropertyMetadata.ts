import { Mutable } from "../Mutable";
import { DirtyKeys } from "../MutationHelper";
import { trackedProperty } from "./metadataMaker";
import { TrackedPropertyMetadata } from "./TrackedPropertyMetadata";

declare module "./TrackedPropertyMetadata" {
  interface MutationTypeDefinitions {
    mutable: "mutable";
  }
}

@trackedProperty("mutable")
export class MutablePropertyMetadata extends TrackedPropertyMetadata<"mutable"> {
  getImmutable(mutable: Mutable<any, any>) {
    return this.getValue<Mutable<any, any>>(
      mutable,
    ).mutationHelper.getImmutable();
  }
}
