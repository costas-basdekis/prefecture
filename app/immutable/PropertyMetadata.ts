export class PropertyMetadata<T> {
  readonly name: string;
  readonly symbol: symbol;

  constructor(name: string) {
    this.name = name;
    this.symbol = Symbol(name);
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
