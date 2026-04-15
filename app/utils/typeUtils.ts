export function unreachableCase(value: never, message: string): never;
export function unreachableCase(message: string) {
  throw new Error(message);
}
