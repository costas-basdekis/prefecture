import { Mutable } from "../Mutable";
import { DirtyKeys } from "../MutationHelper";
import { TrackedPropertyMetadata } from "./TrackedPropertyMetadata";

declare module "./TrackedPropertyMetadata" {
  interface MutationTypeDefinitions {
    mutable: "mutable";
  }
}

export class MutablePropertyMetadata extends TrackedPropertyMetadata<"mutable"> {
  getImmutable(mutable: Mutable<any, any>) {
    return this.getValue<Mutable<any, any>>(
      mutable,
    ).mutationHelper.getImmutable();
  }

  updateImmutable(
    mutable: Mutable<any, any>,
    immutable: any,
    dirtyKeys: DirtyKeys,
  ): void {
    if (dirtyKeys[this.key]) {
      immutable[this.key] = this.getImmutable(mutable);
      dirtyKeys[this.key] = false;
    }
  }
}
