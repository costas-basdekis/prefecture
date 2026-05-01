import type {
  MutationType,
  TrackedPropertyConfig,
  TrackedPropertyMetadata,
} from "./TrackedPropertyMetadata";

export const trackedPropertyMap: Partial<
  Record<MutationType, typeof TrackedPropertyMetadata<any>>
> = {};

export function getTrackedProperty(type: MutationType) {
  const PropertyMetadata = trackedPropertyMap[type];
  if (!PropertyMetadata) {
    throw new Error(`Unknown mutation type ${type}`);
  }
  return PropertyMetadata;
}

export function trackedProperty<T extends MutationType>(type: T) {
  return function (constructor: typeof TrackedPropertyMetadata<T>) {
    trackedPropertyMap[type] = constructor;
  };
}

export function makeTrackedProperty<T extends MutationType>(
  key: string | symbol,
  type: T,
  mutable: boolean,
  config: TrackedPropertyConfig<T>,
): TrackedPropertyMetadata<T> {
  const PropertyMetadata = trackedPropertyMap[type];
  if (!PropertyMetadata) {
    throw new Error(`Unknown mutation type ${type}`);
  }
  // @ts-ignore
  return new PropertyMetadata(
    key,
    type,
    mutable,
    config as TrackedPropertyConfig<"mutable">,
  );
}
