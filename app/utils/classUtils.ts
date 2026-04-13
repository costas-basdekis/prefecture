export function propById<C, T, I>(
  idKey: keyof C,
  getter: (this: C, id: I, thisObject: C) => T | null,
  allowSetter: boolean = true,
  thisIdKey: string = "id",
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
        this[idKey] = value?.[thisIdKey] ?? null;
      };
    }
    Object.defineProperty(target, propertyKey, descriptor);
  };
}
