import { Immutable } from "../Immutable";
import { Mutable } from "../Mutable";
import { TrackedPropertyMetadata } from "./TrackedPropertyMetadata";

declare module "./TrackedPropertyMetadata" {
  interface MutationTypeDefinitions {
    method: "method";
  }
}

export class MethodPropertyMetadata extends TrackedPropertyMetadata<"method"> {
  getImmutable(_mutable: Mutable<any, any>) {
    const propertySelf = this;
    return function <I extends Immutable<any>>(this: I, ...args: any[]): I {
      this._mutable[propertySelf.key].apply(this._mutable, args);
      return this._mutable.mutationHelper.getImmutable();
    };
  }
}
