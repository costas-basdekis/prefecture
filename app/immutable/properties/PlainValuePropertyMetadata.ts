import { Mutable } from "../Mutable";
import { TrackedPropertyMetadata } from "./TrackedPropertyMetadata";

declare module "./TrackedPropertyMetadata" {
  interface MutationTypeDefinitions {
    plainValue: "plainValue";
  }
}

export class PlainValuePropertyMetadata extends TrackedPropertyMetadata<"plainValue"> {
  getImmutable(mutable: Mutable<any, any>) {
    return this.getValue(mutable);
  }
}
