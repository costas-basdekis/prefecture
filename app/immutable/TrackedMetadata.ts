import { ClassMetadata } from "./ClassMetadata";
import { TrackedPropertyMetadata } from "./properties";

const trackedMetadataProperty = new ClassMetadata<TrackedMetadata>(
  "trackedMetadata",
);

export class TrackedMetadata {
  target: Object;
  propertyMap: Map<string | symbol, TrackedPropertyMetadata<any>>;
  keysWithMethodMutationType: Set<string | symbol>;
  parentInfo: {
    key: string | symbol;
    dirtyKey: string;
    secondaryKey: string | symbol | null;
  } | null;

  static getOrSet(target: Object): TrackedMetadata {
    let metadata = trackedMetadataProperty.getOwn(target);
    if (!metadata) {
      metadata = new TrackedMetadata(
        target,
        trackedMetadataProperty.get(target),
      );
      trackedMetadataProperty.define(target, metadata);
    }
    return metadata;
  }

  static get(target: Object): TrackedMetadata {
    const metadata = trackedMetadataProperty.get(target);
    if (!metadata) {
      throw new Error(
        `Mutable metatdata not defined for ${target.constructor.name} instance`,
      );
    }
    return metadata;
  }

  constructor(target: Object, other?: TrackedMetadata) {
    this.target = target;
    this.propertyMap = new Map(other?.propertyMap);
    this.keysWithMethodMutationType = new Set(
      other?.keysWithMethodMutationType,
    );
    this.parentInfo = other?.parentInfo ?? null;
  }
}
