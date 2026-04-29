import { ClassMetadata, ClassMetadataForTarget } from "./ClassMetadata";
import {
  PropertyMetadata,
  PropertyMetadataForProperty,
  PropertyMetadataForTarget,
} from "./PropertyMetadata";

export type MetadataForTarget<
  M extends ClassMetadata<any> | PropertyMetadata<any>,
> =
  M extends ClassMetadata<infer T>
    ? ClassMetadataForTarget<T>
    : M extends PropertyMetadata<infer T>
      ? PropertyMetadataForTarget<T>
      : never;

export type DescriptionForTarget<
  D extends Record<string, ClassMetadata<any> | PropertyMetadata<any>>,
> = { [key in keyof D]: MetadataForTarget<D[key]> };

export type MetadataForProperty<
  M extends ClassMetadata<any> | PropertyMetadata<any>,
> =
  M extends ClassMetadata<infer T>
    ? ClassMetadataForTarget<T>
    : M extends PropertyMetadata<infer T>
      ? PropertyMetadataForProperty<T>
      : never;

export type DescriptionForProperty<
  D extends Record<string, ClassMetadata<any> | PropertyMetadata<any>>,
> = { [key in keyof D]: MetadataForProperty<D[key]> };

export class MetadataRepository<
  D extends Record<string, ClassMetadata<any> | PropertyMetadata<any>>,
> {
  description: D;

  constructor(description: D) {
    this.description = description;
  }

  for(target: Object): DescriptionForTarget<D> {
    const forTarget: Partial<DescriptionForTarget<D>> = {};
    for (const [name, metadata] of Object.entries(this.description)) {
      // @ts-ignore
      forTarget[name] = metadata.for(target);
    }
    return forTarget as DescriptionForTarget<D>;
  }

  forProperty(
    target: Object,
    propertyKey: string | symbol,
  ): DescriptionForProperty<D> {
    const forTarget: Partial<DescriptionForProperty<D>> = {};
    for (const [name, metadata] of Object.entries(this.description)) {
      // @ts-ignore
      forTarget[name] = metadata.forProperty(target, propertyKey);
    }
    return forTarget as DescriptionForProperty<D>;
  }
}
