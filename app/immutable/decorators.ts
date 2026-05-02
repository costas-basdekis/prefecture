import { type Mutable } from "./Mutable";
import { makeTrackedProperty, MutationType } from "./properties";
import { TrackedMetadata } from "./TrackedMetadata";

export function immutable(target: Mutable<any>, propertyKey: string | symbol) {
  const metadata = TrackedMetadata.getOrSet(target);
  const existingProperty = metadata.propertyMap.get(propertyKey);
  if (existingProperty) {
    throw new Error(
      `Immutable key was already defined (${propertyKey.toString()})${existingProperty.type === "immutable" ? "" : " as mutable"} for ${target}`,
    );
  }
  const property = makeTrackedProperty(
    propertyKey,
    propertyKey,
    "plainValue",
    false,
    null,
  );
  metadata.propertyMap.set(propertyKey, property);
  property.addProperties(target);
}

export type MutablePropertyDecorator = (
  target: Mutable<any>,
  propertyKey: string | symbol,
) => void;

export function mutable(
  type: Exclude<MutationType, "plainValueById">,
): MutablePropertyDecorator;
export function mutable(
  type: "plainValueById",
  idKey?: string,
  idPropertyKey?: string,
): MutablePropertyDecorator;
export function mutable(
  type: MutationType,
  idKey: string = "id",
  idPropertyKey?: string,
): MutablePropertyDecorator {
  return function (target: Mutable<any>, propertyKey: string | symbol) {
    const metadata = TrackedMetadata.getOrSet(target);
    const existingProperty = metadata.propertyMap.get(propertyKey);
    if (existingProperty) {
      throw new Error(
        `Mutable key was already defined (${propertyKey.toString()})${existingProperty.mutable ? "" : " as immutable"} for ${target}`,
      );
    }
    const property = makeTrackedProperty(
      propertyKey,
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

export function methodMutate(
  target: Mutable<any>,
  propertyKey: string | symbol,
) {
  const metadata = TrackedMetadata.getOrSet(target);
  const property = makeTrackedProperty(
    propertyKey,
    propertyKey,
    "method",
    false,
    null,
  );
  metadata.propertyMap.set(propertyKey, property);
  property.addProperties(target);
}

export function methodForImmutable(
  renamedPropertyKey: string | symbol,
): MutablePropertyDecorator;
export function methodForImmutable(
  target: Mutable<any>,
  actualPropertyKey: string | symbol,
): void;
export function methodForImmutable(
  targetOrRenamedPropertyKey?: Mutable<any> | string | symbol,
  maybeActualPropertyKey?: string | symbol,
): void | MutablePropertyDecorator {
  const target =
    typeof targetOrRenamedPropertyKey === "object"
      ? targetOrRenamedPropertyKey
      : undefined;
  const actualPropertyKey =
    typeof targetOrRenamedPropertyKey === "object"
      ? maybeActualPropertyKey
      : undefined;
  const renamedPropertyKey =
    typeof targetOrRenamedPropertyKey === "object"
      ? undefined
      : targetOrRenamedPropertyKey;
  const decorator = function (
    target: Mutable<any>,
    actualPropertyKey: string | symbol,
  ) {
    const propertyKey = renamedPropertyKey ?? actualPropertyKey;
    const metadata = TrackedMetadata.getOrSet(target);
    const existingProperty = metadata.propertyMap.get(propertyKey);
    if (existingProperty) {
      throw new Error(
        `Immutable key was already defined (${propertyKey.toString()})${existingProperty.type === "immutable" ? "" : " as mutable"} for ${target}`,
      );
    }
    const property = makeTrackedProperty(
      actualPropertyKey,
      propertyKey,
      "plainValue",
      false,
      null,
    );
    metadata.propertyMap.set(propertyKey, property);
    property.addProperties(target);
  };
  if (target) {
    return decorator(target, actualPropertyKey!);
  } else {
    return decorator;
  }
}

export function parentKey(dirtyKey: string): MutablePropertyDecorator {
  return function (target: Mutable<any>, propertyKey: string | symbol) {
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
  target: Mutable<any>,
  propertyKey: string | symbol,
) {
  const metadata = TrackedMetadata.getOrSet(target);
  if (!metadata.parentInfo) {
    throw new Error(`No parent relationship has been defined for ${target}`);
  }
  if (metadata.parentInfo.secondaryKey) {
    throw new Error(
      `Parent secondary key was already defined (${metadata.parentInfo.secondaryKey.toString()}) for ${target}`,
    );
  }
  metadata.parentInfo.secondaryKey = propertyKey;
}
