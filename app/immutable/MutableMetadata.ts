import { ClassMetadata } from "./ClassMetadata";
import { MutablePropertyMetadata } from "./properties";

const mutableMetadataProperty = new ClassMetadata<MutableMetadata>(
  "mutableMetadata",
);

export class MutableMetadata {
  target: Object;
  mutableMap: Map<string | symbol, MutablePropertyMetadata<any>>;
  keysWithMethodMutationType: Set<string | symbol>;
  parentInfo: {
    key: string | symbol;
    dirtyKey: string;
    secondaryKey: string | symbol | null;
  } | null;

  static getOrSet(target: Object): MutableMetadata {
    let metadata = mutableMetadataProperty.getOwn(target);
    if (!metadata) {
      metadata = new MutableMetadata(
        target,
        mutableMetadataProperty.get(target),
      );
      mutableMetadataProperty.define(target, metadata);
    }
    return metadata;
  }

  static get(target: Object): MutableMetadata {
    const metadata = mutableMetadataProperty.get(target);
    if (!metadata) {
      throw new Error(
        `Mutable metatdata not defined for ${target.constructor.name} instance`,
      );
    }
    return metadata;
  }

  constructor(target: Object, other?: MutableMetadata) {
    this.target = target;
    this.mutableMap = new Map(other?.mutableMap);
    this.keysWithMethodMutationType = new Set(
      other?.keysWithMethodMutationType,
    );
    this.parentInfo = other?.parentInfo ?? null;
  }
}
