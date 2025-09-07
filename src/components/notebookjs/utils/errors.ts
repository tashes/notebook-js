export function Wrap(message: string, error: Error): Error {
  const e = new Error(`${message}:${error.message}`);
  (e as any).stack = error.stack;
  return e;
}

export function List(errors: Error[]): Error {
  const e = new Error(`[${errors.map((oe) => oe.message).join(",")}]`);
  return e;
}

export function Unwrap(wrappedError: Error): Error[] {
  const message = wrappedError.message
    .split(":")
    .map((a) => a.trim())
    .reverse();
  const stack = (wrappedError.stack || "").split("\n");
  stack.shift();
  const errs: Error[] = [];
  const len = message.length;
  for (let i = 0; i < len; i++) {
    const err = new Error(message[i]);
    (err as any).stack = [`Error: ${message[i]}`, ...stack].join("\n");
    stack.shift();
    errs.push(err);
  }
  return errs;
}

export function Has(wrappedError: Error, errorMessage: string): boolean {
  const errors = Unwrap(wrappedError);
  const len = errors.length;
  for (let i = 0; i < len; i++) {
    const err = errors[i];
    if (err.message === errorMessage) {
      return true;
    }
  }
  return false;
}

export function Panic(location: string, panicError: Error, handledError: Error): void {
  const e = new Error(
    `Error recovering at ${location} from error: ${handledError.message}. ERROR THROWN: ${panicError.message}`,
  );
  (e as any).stack = (panicError as any).stack;
  // eslint-disable-next-line no-console
  console.error(e);
}
