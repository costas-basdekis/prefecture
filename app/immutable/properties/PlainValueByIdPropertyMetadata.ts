import { Mutable } from "../Mutable";
import { DirtyKeys } from "../MutationHelper";
import { TrackedPropertyMetadata } from "./TrackedPropertyMetadata";

declare module "./TrackedPropertyMetadata" {
  interface MutationTypeDefinitions {
    plainValueById: "plainValueById";
  }
}

export class PlainValueByIdPropertyMetadata extends TrackedPropertyMetadata<"plainValueById"> {
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
