/**
 *
 */
export type Attribute = Callback<
  string | null,
  bigint | boolean | null | number | string | symbol | undefined | void
>[];

/**
 *
 */
export interface Attributes {
  [key: string]:
    | Attribute
    | bigint
    | boolean
    | null
    | number
    | string
    | symbol
    | undefined
    | void;
}

interface Bag {
  [disposables]: Disposable[];
}

/**
 *
 */
export interface Callback<V, R = void> {
  (value: V): R;
}

/**
 *
 */
export interface Disposable {
  dispose(): void;
}

/**
 *
 */
export interface Mutable<V> {
  value: V;
}

const disposables = Symbol();

export function dispose(...nodes: ParentNode[]) {
  for (const node of nodes) {
    dispose(...node.children);

    if (hasDisposables(node)) {
      for (const disposable of node[disposables]) {
        disposable.dispose();
      }

      node[disposables] = [];
    }
  }
}

export function getDisposables(node: object): Disposable[] {
  if (hasDisposables(node)) {
    return node[disposables];
  }

  const items: Disposable[] = [];

  Object.assign(node, { [disposables]: items });

  return items;
}

function hasDisposables(target: object): target is Bag {
  return disposables in target;
}

/**
 *
 * @param attributes
 */
export function set(
  attributes: Attributes,
  namespace?: string,
): Callback<Element> {
  const ns = namespace || null;

  return (element) => {
    for (const [name, value] of Object.entries(attributes)) {
      if (value == null) {
        element.removeAttributeNS(ns, name);
      } else if (Array.isArray(value)) {
        for (const callback of value) {
          const disposables = getDisposables(element);

          disposables.push(
            spy(() => {
              const value = callback(element.getAttributeNS(ns, name));

              if (value == null) {
                element.removeAttributeNS(ns, name);
              } else {
                element.setAttributeNS(ns, name, String(value));
              }
            }),
          );
        }
      } else {
        element.setAttributeNS(ns, name, String(value));
      }
    }
  };
}

const current: {
  disposables: Set<Disposable>[];
  observers: Callback<unknown>[];
} = { disposables: [], observers: [] };

/**
 *
 * @param callback
 * @param dependencies
 * @returns
 */
export function spy<V>(
  callback: Callback<void, V>,
): Callback<unknown, V> & Mutable<V> & Disposable {
  const disposables = new Set<Disposable>();

  const observer = () => {
    observable.value = callback();
  };

  current.disposables.push(disposables);
  current.observers.push(observer);

  const observable = use(callback());

  current.observers.pop();
  current.disposables.pop();

  const dispose = observable.dispose;

  return Object.assign(observable, {
    dispose() {
      for (const disposable of disposables) {
        disposable.dispose();
      }

      disposables.clear();
      dispose();
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
  const observers = new Set<Callback<V>>();

  const get = () => {
    const observer = current.observers.at(-1);
    const disposables = current.disposables.at(-1);

    if (!observer || !disposables) {
      return value;
    }

    observers.add(observer);
    disposables.add({
      dispose() {
        observers.delete(observer);
      },
    });

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

        for (const observe of observers.values()) {
          observe(value);
        }
      },
    },
  );
}
