import { Function } from "./core.ts";

interface Callback<V = unknown> extends Function<void, V> {}

interface Observable extends Function<Observer, Function> {}

interface Observer extends Function {}

/**
 *
 */
export interface Mutable<V = unknown> {
  value: V;
}

const current: { observables?: Observable[] } = {};

/**
 *
 * @param callback
 * @returns
 */
export function spy<V>(callback: Callback<V>): Mutable<V> {
  const observables = current.observables;

  current.observables = [];

  let value: V;

  const observer = () => {
    const mutable = mutableRef.deref();

    if (!mutable) {
      return;
    }

    const callback = callbackRef.get(mutable);

    if (!callback) {
      return;
    }

    try {
      mutable.value = callback();
    } catch (error) {
      console.error(error);
    }
  };

  let mutable: Mutable<V>;

  try {
    value = callback();
    mutable = use(value);

    for (const add of current.observables) {
      registry.register(mutable, add(observer));
    }
  } finally {
    current.observables = observables;
  }

  const mutableRef = new WeakRef(mutable);
  const callbackRef = new WeakMap<WeakKey, Callback<V>>();

  callbackRef.set(mutable, callback);

  return mutable;
}

/**
 *
 * @param value
 * @returns
 */
export function use<V>(value: V): Mutable<V> {
  const observers = new Set<Observer>();
  const observable = (observer: Observer) => (
    observers.add(observer), () => observers.delete(observer)
  );

  return {
    get value() {
      if (current.observables) {
        current.observables.push(observable);
      }

      return value;
    },
    set value(next: V) {
      if (value === next) {
        return;
      }

      value = next;

      for (const observer of observers) {
        observer();
      }
    },
  };
}

const registry = new FinalizationRegistry(
  (callback: Function) => (callback(), console.log("cleanup")),
);
