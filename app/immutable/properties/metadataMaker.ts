import { unreachableCase } from "~/utils";
import { MethodPropertyMetadata } from "./MethodPropertyMetadata";
import { MutablePropertyMetadata } from "./MutablePropertyMetadata";
import { MutableMapPropertyMetadata } from "./MutableMapPropertyMetadata";
import { PlainValuePropertyMetadata } from "./PlainValuePropertyMetadata";
import { PlainValueArrayPropertyMetadata } from "./PlainValueArrayPropertyMetadata";
import { PlainValueMapPropertyMetadata } from "./PlainValueMapPropertyMetadata";
import { PlainValueByIdPropertyMetadata } from "./PlainValueByIdPropertyMetadata";
import type {
  MutationType,
  TrackedPropertyConfig,
  TrackedPropertyMetadata,
} from "./TrackedPropertyMetadata";

export function makeTrackedProperty<T extends MutationType>(
  key: string | symbol,
  type: T,
  mutable: boolean,
  config: TrackedPropertyConfig<T>,
): TrackedPropertyMetadata<T> {
  switch (type) {
    case "mutable":
      return new MutablePropertyMetadata(
        key,
        type,
        mutable,
        config as TrackedPropertyConfig<"mutable">,
      ) as TrackedPropertyMetadata<T>;
    case "mutableMap":
      return new MutableMapPropertyMetadata(
        key,
        type,
        mutable,
        config as TrackedPropertyConfig<"mutableMap">,
      ) as TrackedPropertyMetadata<T>;
    case "plainValue":
      return new PlainValuePropertyMetadata(
        key,
        type,
        mutable,
        config as TrackedPropertyConfig<"plainValue">,
      ) as TrackedPropertyMetadata<T>;
    case "plainValueArray":
      return new PlainValueArrayPropertyMetadata(
        key,
        type,
        mutable,
        config as TrackedPropertyConfig<"plainValueArray">,
      ) as TrackedPropertyMetadata<T>;
    case "plainValueMap":
      return new PlainValueMapPropertyMetadata(
        key,
        type,
        mutable,
        config as TrackedPropertyConfig<"plainValueMap">,
      ) as TrackedPropertyMetadata<T>;
    case "plainValueById":
      return new PlainValueByIdPropertyMetadata(
        key,
        type,
        mutable,
        config as TrackedPropertyConfig<"plainValueById">,
      ) as TrackedPropertyMetadata<T>;
    case "method":
      return new MethodPropertyMetadata(
        key,
        type,
        mutable,
        config as TrackedPropertyConfig<"method">,
      ) as TrackedPropertyMetadata<T>;
    default:
      throw unreachableCase(type, `Unknown mutation type ${type}`);
  }
}
