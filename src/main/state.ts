/** */
export interface Function<V = void, R = void> {
  (value: V): R;
}

/** */
export interface Mutable<V = unknown> {
  value: V;
}

interface Observable extends Function<Observer, Function> {}

interface Observer extends Function {}

interface Spy<V = unknown> extends Function<void, V> {}

const current: { observables?: Set<Observable> } = {};
const registry = new FinalizationRegistry((callback: Function) => callback());

/**
 * @param spy
 * @returns
 */
export function spy<V>(spy: Spy<V>): Mutable<V> {
  const { observables } = current;

  current.observables = new Set();

  const observer = () => {
    const mutable = mutableRef.deref();

    if (!mutable) {
      return;
    }

    try {
      mutable.value = spy();
    } catch (error) {
      console.error(error);
    }
  };

  let mutable: Mutable<V>;

  try {
    mutable = use(spy());

    for (const add of current.observables) {
      registry.register(mutable, add(observer));
    }
  } finally {
    current.observables = observables;
  }

  const mutableRef = new WeakRef(mutable);

  return mutable;
}

/**
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
      return current.observables?.add(observable), value;
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
