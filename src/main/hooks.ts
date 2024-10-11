import { Disposable, Function, Mutable } from "./types.ts";

const current: {
  disposable?: Disposable;
  observer?: Function<unknown>;
} = {};

/**
 *
 * @param attributes
 */
export function set(attributes: object, namespace?: string): Function<Element> {
  return (element) => {
    for (const [name, value] of Object.entries(attributes)) {
      if (value == null) {
        element.removeAttributeNS(namespace || null, name);
      } else {
        element.setAttributeNS(namespace || null, name, String(value));
      }
    }
  };
}

/**
 *
 * @param callback
 * @param dependencies
 * @returns
 */
export function spy<V>(
  callback: Function<void, V>,
): Function<unknown, V> & Mutable<V> & Disposable {
  const disposables = new Set<Disposable>();

  const observer = () => {
    current.observer = observer;
    observable.value = callback();

    if (current.disposable) {
      disposables.add(current.disposable);
    }

    current.observer = undefined;
    current.disposable = undefined;
  };

  current.observer = observer;
  const observable = use(callback());
  current.observer = undefined;
  current.disposable = undefined;

  return Object.assign(observable, {
    dispose() {
      for (const disposable of disposables) {
        disposable.dispose();
      }

      observable.dispose();
    },
  });
}

/**
 *
 * @param value
 * @param view
 * @returns
 */
export function use<V>(
  value: V,
): Function<unknown, V> & Disposable & Mutable<V> {
  const observers = new Map<Function<V>, Disposable>();

  const get = () => {
    const observer = current.observer;

    if (observer && !observers.has(observer)) {
      const disposable = {
        dispose() {
          observers.delete(observer);
        },
      };

      observers.set(observer, disposable);

      current.disposable = disposable;
    }

    return value;
  };

  return Object.defineProperty(
    Object.assign(get, {
      dispose() {
        observers.clear();
      },
      value,
    }),
    "value",
    {
      get,
      set(next: V) {
        if (value === next) {
          return;
        }

        value = next;

        for (const observe of observers.keys()) {
          observe(value);
        }
      },
    },
  );
}
