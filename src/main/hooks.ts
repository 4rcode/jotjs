import { Disposable, Function, Mutable } from "./types.ts";

const current: {
  disposables: Disposable[][];
  observers: Function<unknown>[];
} = { disposables: [], observers: [] };

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
  const garbage = new Set<Disposable>();

  const observer = () => {
    observable.value = callback();
  };

  current.disposables.push([]);
  current.observers.push(observer);

  const observable = use(callback());
  const disposables = current.disposables.at(-1);

  if (disposables) {
    for (const disposable of disposables) {
      garbage.add(disposable);
    }
  }

  current.observers.pop();
  current.disposables.pop();

  return Object.assign(observable, {
    dispose() {
      for (const disposable of garbage) {
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
  const observers = new Set<Function<V>>();

  const get = () => {
    const observer = current.observers.at(-1);
    const disposables = current.disposables.at(-1);

    if (observer && disposables) {
      observers.add(observer);
      disposables.push({
        dispose() {
          observers.delete(observer);
        },
      });
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
