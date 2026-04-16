export class EventsManager {
  events: OnEvent<any>[] = [];

  add<C extends OnEventCallback>(): OnEvent<C>;
  add<C extends OnEventCallback>(event: OnEvent<C>): OnEvent<C>;
  add<C extends OnEventCallback>(event?: OnEvent<C>): OnEvent<C> {
    if (!event) {
      event = new OnEvent<C>();
    }
    this.events.push(event);
    return event;
  }

  clearAll() {
    for (const event of this.events) {
      event.clear();
    }
  }
}

export type OnEventCallback = (...args: any) => any;

export class OnEvent<C extends OnEventCallback> {
  callbacks: C[] | null = [];

  register(callback: C) {
    if (!this.callbacks) {
      throw new Error("Trying to register to cleared event");
    }
    this.callbacks.push(callback);
  }

  trigger(...args: Parameters<C>) {
    if (!this.callbacks) {
      throw new Error("Trying to trigger cleared event");
    }
    for (const callback of this.callbacks) {
      callback.apply(null, args);
    }
  }

  clear() {
    if (!this.callbacks) {
      throw new Error("Trying to clear cleared event");
    }
    this.callbacks = null;
  }
}
