import { makeTrackedProperty, MutationType } from "./properties";
import { TrackedMetadata } from "./TrackedMetadata";

export function immutable(target: Object, propertyKey: string | symbol) {
  const metadata = TrackedMetadata.getOrSet(target);
  const existingProperty = metadata.propertyMap.get(propertyKey);
  if (existingProperty) {
    throw new Error(
      `Immutable key was already defined (${propertyKey.toString()})${existingProperty.type === "immutable" ? "" : " as mutable"} for ${target}`,
    );
  }
  const property = makeTrackedProperty(propertyKey, "plainValue", false, null);
  metadata.propertyMap.set(propertyKey, property);
  property.addProperties(target);
}

export function mutable(
  type: Exclude<MutationType, "plainValueById">,
): PropertyDecorator;
export function mutable(
  type: "plainValueById",
  idKey?: string,
  idPropertyKey?: string,
): PropertyDecorator;
export function mutable(
  type: MutationType,
  idKey: string = "id",
  idPropertyKey?: string,
): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    const metadata = TrackedMetadata.getOrSet(target);
    const existingProperty = metadata.propertyMap.get(propertyKey);
    if (existingProperty) {
      throw new Error(
        `Mutable key was already defined (${propertyKey.toString()})${existingProperty.mutable ? "" : " as immutable"} for ${target}`,
      );
    }
    const property = makeTrackedProperty(
      propertyKey,
      type,
      true,
      type === "plainValueById"
        ? {
            idKey: idKey ?? "id",
            idPropertyKey: idPropertyKey ?? `${propertyKey.toString()}Id`,
          }
        : null,
    );
    metadata.propertyMap.set(propertyKey, property);
    property.addProperties(target);
  };
}

export function methodMutate(target: Object, propertyKey: string | symbol) {
  const metadata = TrackedMetadata.getOrSet(target);
  const property = makeTrackedProperty(propertyKey, "method", false, null);
  metadata.propertyMap.set(propertyKey, property);
  property.addProperties(target);
}

export function parentKey(dirtyKey: string) {
  return function (target: Object, propertyKey: string | symbol) {
    const metadata = TrackedMetadata.getOrSet(target);
    if (metadata.parentInfo) {
      throw new Error(
        `Parent key was already defined (${metadata.parentInfo.key.toString()}) for ${target}`,
      );
    }
    metadata.parentInfo = {
      key: propertyKey,
      dirtyKey,
      secondaryKey: null,
    };
  };
}

export function parentSecondaryKey(
  target: Object,
  propertyKey: string | symbol,
) {
  const metadata = TrackedMetadata.getOrSet(target);
  if (!metadata.parentInfo) {
    throw new Error(`Not parent relationship has been defined for ${target}`);
  }
  if (metadata.parentInfo.secondaryKey) {
    throw new Error(
      `Parent secondary key was already defined (${metadata.parentInfo.secondaryKey.toString()}) for ${target}`,
    );
  }
  metadata.parentInfo.secondaryKey = propertyKey;
}
