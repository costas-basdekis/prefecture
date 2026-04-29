export class MetadataProperty<T> {
  readonly name: string;
  readonly symbol: symbol;

  constructor(name: string) {
    this.name = name;
    this.symbol = Symbol(name);
  }

  define(target: Object, value: T) {
    Reflect.defineMetadata(this.symbol, value, target);
  }

  defineOnProperty(target: Object, propertyKey: string | symbol, value: T) {
    Reflect.defineMetadata(this.symbol, value, target, propertyKey);
  }

  getOwn(target: Object): T | undefined {
    return Reflect.getOwnMetadata(this.symbol, target);
  }

  getOwnForProperty(
    target: Object,
    propertyKey: string | symbol,
  ): T | undefined {
    return Reflect.getOwnMetadata(this.symbol, target, propertyKey);
  }

  get(target: Object): T | undefined {
    return Reflect.getMetadata(this.symbol, target);
  }

  getForProperty(target: Object, propertyKey: string | symbol): T | undefined {
    return Reflect.getMetadata(this.symbol, target, propertyKey);
  }
}
