import { ClassMetadata } from "./ClassMetadata";
import { type MutationType } from "./MutationHelper";

const mutableMetadataProperty = new ClassMetadata<MutableMetadata>(
  "mutableMetadata",
);

export class MutableMetadata {
  target: Object;
  keysWithNoMutation: Set<string | symbol>;
  keysWithMutationType: Set<string | symbol>;
  keysWithMethodMutationType: Set<string | symbol>;
  parentInfo: {
    parentKey: string | symbol;
    dirtyKey: string;
  } | null;
  parentSecondaryKey: string | symbol | null;
  mutationTypeMap: Record<string | symbol, MutationType>;
  mutationIdKeyMap: Record<string | symbol, string>;
  mutationIdPropertyKeyMap: Record<string | symbol, string>;

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
    this.keysWithMutationType = new Set(other?.keysWithMutationType);
    this.keysWithMethodMutationType = new Set(
      other?.keysWithMethodMutationType,
    );
    this.parentInfo = other?.parentInfo ?? null;
    this.parentSecondaryKey = other?.parentSecondaryKey ?? null;
    this.mutationTypeMap = other?.mutationTypeMap ?? {};
    this.mutationIdKeyMap = other?.mutationIdKeyMap ?? {};
    this.mutationIdPropertyKeyMap = other?.mutationIdPropertyKeyMap ?? {};
  }
}
