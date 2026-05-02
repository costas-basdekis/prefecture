import { Mutable } from "../Mutable";
import { trackedProperty } from "./metadataMaker";
import {
  type TrackedPropertyConfig,
  TrackedPropertyMetadata,
} from "./TrackedPropertyMetadata";

declare module "./TrackedPropertyMetadata" {
  interface MutationTypeDefinitions {
    plainValueById: "plainValueById";
  }
}

@trackedProperty("plainValueById")
export class PlainValueByIdPropertyMetadata extends TrackedPropertyMetadata<"plainValueById"> {
  constructor(
    key: string | symbol,
    _renamedKey: string | symbol,
    type: "plainValueById",
    mutable: boolean,
    config: TrackedPropertyConfig<"plainValueById">,
  ) {
    super(key, config.idPropertyKey, type, mutable, config);
  }

  addProperties(target: Mutable<any>) {
    super.addProperties(target);
    const propertySelf = this;
    Object.defineProperty(target, propertySelf.config.idPropertyKey, {
      get: function (this: Mutable<any>) {
        const mainValue = this[propertySelf.key as keyof typeof this] as any;
        if (!mainValue) {
          return null;
        }
        return mainValue[propertySelf.config.idKey];
      },
    });
  }

  getImmutable(mutable: Mutable<any>) {
    return this.getValue(mutable)?.[this.config.idKey] ?? null;
  }
}
