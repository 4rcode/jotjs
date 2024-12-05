import { Function } from "./core.ts";

interface Callback<V = unknown> extends Function<void, V> {}

/**
 *
 */
export interface Mutable<V = unknown> {
  value: V;
}

interface Observable extends Function<Observer, Function> {}

interface Observer extends Function {}

const current: { observables?: Set<Observable> } = {};
const registry = new FinalizationRegistry((callback: Function) => callback());

/**
 *
 * @param callback
 * @returns
 */
export function spy<V>(callback: Callback<V>): Mutable<V> {
  const observables = current.observables;

  current.observables = new Set();

  const observer = () => {
    const mutable = reference.deref();

    if (!mutable) {
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
    mutable = use(callback());

    for (const add of current.observables) {
      registry.register(mutable, add(observer));
    }
  } finally {
    current.observables = observables;
  }

  const reference = new WeakRef(mutable);

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
        current.observables.add(observable);
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
