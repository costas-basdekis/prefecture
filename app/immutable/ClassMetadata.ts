export class ClassMetadata<T> {
  readonly symbol: symbol;

  constructor(name?: string) {
    this.symbol = Symbol(name);
  }

  for(target: Object): ClassMetadataForTarget<T> {
    return new ClassMetadataForTarget(this, target);
  }

  forProperty(
    target: Object,
    _propertyKey: string | symbol,
  ): ClassMetadataForTarget<T> {
    return new ClassMetadataForTarget(this, target);
  }

  define(target: Object, value: T) {
    Reflect.defineMetadata(this.symbol, value, target);
  }

  getOwn(target: Object): T | undefined {
    return Reflect.getOwnMetadata(this.symbol, target);
  }

  get(target: Object): T | undefined {
    return Reflect.getMetadata(this.symbol, target);
  }
}

export class ClassMetadataForTarget<T> {
  readonly classMetadata: ClassMetadata<T>;
  readonly target: Object;

  constructor(classMetadata: ClassMetadata<T>, target: Object) {
    this.classMetadata = classMetadata;
    this.target = target;
  }

  for(_propertyKey: string | symbol): ClassMetadataForTarget<T> {
    return this;
  }

  define(value: T) {
    this.classMetadata.define(this.target, value);
  }

  getOwn(): T | undefined {
    return this.classMetadata.getOwn(this.target);
  }

  get(): T | undefined {
    return this.classMetadata.get(this.target);
  }
}
