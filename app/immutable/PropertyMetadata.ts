export class PropertyMetadata<T> {
  readonly symbol: symbol;

  constructor(name?: string) {
    this.symbol = Symbol(name);
  }

  for(target: Object): PropertyMetadataForTarget<T> {
    return new PropertyMetadataForTarget(this, target);
  }

  forProperty(
    target: Object,
    propertyKey: string | symbol,
  ): PropertyMetadataForProperty<T> {
    return this.for(target).for(propertyKey);
  }

  define(target: Object, propertyKey: string | symbol, value: T) {
    Reflect.defineMetadata(this.symbol, value, target, propertyKey);
  }

  getOwn(target: Object, propertyKey: string | symbol): T | undefined {
    return Reflect.getOwnMetadata(this.symbol, target, propertyKey);
  }

  get(target: Object, propertyKey: string | symbol): T | undefined {
    return Reflect.getMetadata(this.symbol, target, propertyKey);
  }
}

export class PropertyMetadataForTarget<T> {
  readonly propertyMetadata: PropertyMetadata<T>;
  readonly target: Object;

  constructor(propertyMetadata: PropertyMetadata<T>, target: Object) {
    this.propertyMetadata = propertyMetadata;
    this.target = target;
  }

  for(propertyKey: string | symbol): PropertyMetadataForProperty<T> {
    return new PropertyMetadataForProperty(this, propertyKey);
  }

  define(propertyKey: string | symbol, value: T) {
    return this.propertyMetadata.define(this.target, propertyKey, value);
  }

  getOwn(propertyKey: string | symbol): T | undefined {
    return this.propertyMetadata.getOwn(this.target, propertyKey);
  }

  get(propertyKey: string | symbol): T | undefined {
    return this.propertyMetadata.get(this.target, propertyKey);
  }
}

export class PropertyMetadataForProperty<T> {
  readonly propertyMetadataForTarget: PropertyMetadataForTarget<T>;
  readonly propertyKey: string | symbol;

  constructor(
    propertyMetadataForTarget: PropertyMetadataForTarget<T>,
    propertyKey: string | symbol,
  ) {
    this.propertyMetadataForTarget = propertyMetadataForTarget;
    this.propertyKey = propertyKey;
  }

  define(value: T) {
    return this.propertyMetadataForTarget.define(this.propertyKey, value);
  }

  getOwn(): T | undefined {
    return this.propertyMetadataForTarget.getOwn(this.propertyKey);
  }

  get(): T | undefined {
    return this.propertyMetadataForTarget.get(this.propertyKey);
  }
}
