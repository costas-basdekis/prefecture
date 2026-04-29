export class ClassMetadata<T> {
  readonly name: string;
  readonly symbol: symbol;

  constructor(name: string) {
    this.name = name;
    this.symbol = Symbol(name);
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
