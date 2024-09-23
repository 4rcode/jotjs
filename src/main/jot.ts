/**
 *
 */
export interface Callback<E extends HTMLElement> {
  (element: E): void;
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
export interface Hook<E extends HTMLElement> {
  hook(element: E): void;
}

/**
 *
 */
export interface Observable<V> {
  add(observer: Observer<V>): Disposable;
  value: V;
}

/**
 *
 */
export interface Observer<V> {
  (value: V): void;
}

/**
 *
 */
export type Option<E extends HTMLElement> =
  | string
  | Node
  | Partial<E>
  | object[]
  | Callback<E>
  | Hook<E>;

/**
 *
 */
export type Tags = {
  [T in keyof HTMLElementTagNameMap]: (
    ...options: Option<HTMLElementTagNameMap[T]>[]
  ) => HTMLElementTagNameMap[T];
};

/**
 *
 * @param options
 * @returns
 */
export function $(...options: unknown[]) {
  const fragment = jot.createDocumentFragment();

  for (const option of options) {
    parse(option, fragment);
  }

  return fragment;
}

function parse(option: unknown, node: ParentNode): void {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "bigint":
    case "boolean":
    case "number":
    case "symbol":
      return node.append(String(option));
    case "string":
      return node.append(option);
    case "function":
      return option(node);
    case "object":
      if ("hook" in option && typeof option.hook === "function") {
        return option.hook(node);
      }

      if (option instanceof Node) {
        return node.append(option);
      }

      if (option instanceof Array) {
        if (node instanceof HTMLElement) {
          for (const attributes of option) {
            for (const [name, value] of Object.entries(attributes)) {
              if (value == null) {
                node.removeAttribute(name);
              } else {
                node.setAttribute(name, value == null ? "" : String(value));
              }
            }
          }
        }
      } else {
        Object.assign(node, option);
      }
  }
}

let jot: Document = document;

/**
 *
 * @param document
 */
export function setDocument(document: Document): void {
  jot = document;
}

/**
 *
 */
export const tags = new Proxy(<Tags>{}, {
  get(target, property, receiver) {
    if (typeof property !== "string") {
      return Reflect.get(target, property, receiver);
    }

    return (...options: unknown[]) => {
      const element = jot.createElement(property);

      for (const option of options) {
        parse(option, element);
      }

      return element;
    };
  },
});

/**
 *
 * @param value
 * @returns
 */
export function text(value?: unknown): [Text, (value?: unknown) => void] {
  const node = jot.createTextNode(value == null ? "" : String(value));

  return [
    node,
    (value?: unknown) => {
      node.textContent = value == null ? "" : String(value);
    },
  ];
}

/**
 *
 * @param value
 * @param view
 * @returns
 */
export function use<V>(
  value: V,
  view?: (value: V) => unknown,
): Observable<V> & Hook<HTMLElement> & Disposable {
  const disposables = new Set<Disposable>();
  const observers = new Set<Observer<V>>();

  const add = (observer: Observer<V>) => {
    observers.add(observer);

    return {
      dispose() {
        observers.delete(observer);
      },
    };
  };

  if (view == null) {
    view = (value: V) => value;
  }

  return {
    add,
    dispose() {
      for (const disposable of disposables) {
        disposable.dispose();
        disposables.delete(disposable);
      }
    },
    hook(element: HTMLElement) {
      const data = view(value);

      if (data == null || !(data instanceof Node)) {
        const [node, set] = text(data);

        disposables.add(add((value) => set(view(value))));

        return element.append(node);
      }

      const start = jot.createTextNode("");
      const end = jot.createTextNode("");
      const range = jot.createRange();

      element.append(start, data, end);

      range.setStartAfter(start);
      range.setEndBefore(end);

      disposables.add(
        add((state) => {
          range.deleteContents();
          range.insertNode(view(state) as Node);
        }),
      );
    },
    get value() {
      return value;
    },

    set value(next: V) {
      if (value === next) {
        return;
      }

      value = next;

      for (const observe of observers) {
        observe(value);
      }
    },
  };
}

/**
 *
 * @param map
 * @param dependencies
 * @param view
 * @returns
 */
export function view(
  view: () => unknown,
  ...dependencies: Observable<unknown>[]
): Observable<unknown> {
  const observable = use(view());
  const observer = () => {
    observable.value = view();
  };

  for (const dependency of dependencies) {
    dependency.add(observer);
  }

  return observable;
}
