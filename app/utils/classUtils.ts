export function propById<C, T, I>(
  idKey: keyof C,
  getter: (this: C, id: I, thisObject: C) => T | null,
  {
    allowSetter = true,
    thisIdKey = "id",
    allowNull = true,
  }: { allowSetter?: boolean; thisIdKey?: string; allowNull?: boolean } = {},
) {
  return function (target: Object, propertyKey: string | symbol) {
    const descriptor: PropertyDescriptor & ThisType<C> = {
      get: function () {
        if (!this[idKey]) {
          return null;
        }
        return getter.call(this, this[idKey] as any, this);
      },
    };
    if (allowSetter) {
      descriptor.set = function (this: C, value) {
        const newId = value?.[thisIdKey] ?? null;
        if (!allowNull && !newId) {
          throw new Error(`Null is not allowed for "${idKey.toString()}"`);
        }
        this[idKey] = newId;
      };
    }
    Object.defineProperty(target, propertyKey, descriptor);
  };
}
