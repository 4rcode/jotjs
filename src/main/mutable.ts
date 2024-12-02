import { Function } from "./core.ts";

interface Observable extends Function<Observer> {}

interface Observer extends Function<void, boolean> {}

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
export function spy<V>(callback: Function<void, V>): Mutable<V> {
  const observables = current.observables;

  current.observables = [];

  const observer = () => {
    const mutable = reference.deref();

    if (!mutable) {
      return true;
    }

    try {
      mutable.value = callback();
    } catch (error) {
      console.error(error);
    }

    return false;
  };

  let value: V;

  try {
    value = callback();

    for (const add of current.observables) {
      add(observer);
    }
  } finally {
    current.observables = observables;
  }

  const mutable = use(value);
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
  const observable = (observer: Observer) => observers.add(observer);

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
        if (observer()) {
          observers.delete(observer);
        }
      }
    },
  };
}
