import { ClassMetadata } from "./ClassMetadata";
import { type MutationType } from "./MutationHelper";

const mutableMetadataProperty = new ClassMetadata<MutableMetadata>(
  "mutableMetadata",
);

export class MutableMetadata {
  target: Object;
  keysWithNoMutation: Set<string | symbol>;
  mutableMap: Map<string | symbol, MutablePropertyMetadata<any>>;
  keysWithMethodMutationType: Set<string | symbol>;
  parentInfo: {
    parentKey: string | symbol;
    dirtyKey: string;
  } | null;
  parentSecondaryKey: string | symbol | null;

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
    this.keysWithNoMutation = new Set(other?.keysWithNoMutation);
    this.mutableMap = new Map(other?.mutableMap);
    this.keysWithMethodMutationType = new Set(
      other?.keysWithMethodMutationType,
    );
    this.parentInfo = other?.parentInfo ?? null;
    this.parentSecondaryKey = other?.parentSecondaryKey ?? null;
  }
}

export type MutablePropertyConfig<T extends MutationType> =
  T extends "plainValueById"
    ? { idKey: string | symbol; idPropertyKey: string | symbol }
    : null;

export class MutablePropertyMetadata<T extends MutationType> {
  key: string | symbol;
  type: T;
  config: MutablePropertyConfig<T>;

  constructor(key: string | symbol, type: T, config: MutablePropertyConfig<T>) {
    this.key = key;
    this.type = type;
    this.config = config;
  }
}
