import { Callback, Disposable, Mutable } from "./types.ts";

const current: { observer?: () => void } = {};

/**
 *
 * @param attributes
 */
export function set(attributes: object, namespace?: string): Callback<Element> {
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
  callback: Callback<V, V>,
  // view?: (value: V) => Option<ParentNode>,
): Mutable<V> & Disposable {
  const observer = () => {
    current.observer = observer;
    observable.value = callback(observable.value);
    current.observer = undefined;
  };

  current.observer = observer;
  const observable = use(callback(undefined as V));
  current.observer = undefined;

  // const disposables = dependencies.map((dependency) =>
  //   dependency.add(observer),
  // );

  return Object.assign(observable, {
    dispose() {
      // for (const disposable of disposables) {
      //   disposable.dispose();
      // }

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
): Callback<unknown, V> & Disposable & Mutable<V> {
  const observers = new Set<Callback<V, void>>();

  return Object.defineProperties(
    Object.assign(() => value, {
      dispose() {
        observers.clear();
      },
      value,
    }),
    {
      // add(observer: Observer<V>) {
      //   observers.add(observer);

      //   return {
      //     dispose() {
      //       observers.delete(observer);
      //     },
      //   };
      // },
      value: {
        get() {
          if (current.observer) {
            observers.add(current.observer);
          }

          return value;
        },

        set(next: V) {
          if (value === next) {
            return;
          }

          value = next;

          for (const observe of observers) {
            observe(value);
          }
        },
      },
    },
  );
}
