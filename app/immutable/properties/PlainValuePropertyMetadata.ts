import { Mutable } from "../Mutable";
import { trackedProperty } from "./metadataMaker";
import { TrackedPropertyMetadata } from "./TrackedPropertyMetadata";

declare module "./TrackedPropertyMetadata" {
  interface MutationTypeDefinitions {
    plainValue: "plainValue";
  }
}

@trackedProperty("plainValue")
export class PlainValuePropertyMetadata extends TrackedPropertyMetadata<"plainValue"> {
  getImmutable(mutable: Mutable<any>) {
    return this.getValue(mutable);
  }
}
