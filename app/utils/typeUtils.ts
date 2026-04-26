export function unreachableCase(value: never, message: string): never;
export function unreachableCase(
  valuerOrMessage: string | never,
  maybeMessage: string | undefined,
) {
  const message = maybeMessage ?? valuerOrMessage;
  throw new Error(message);
}
