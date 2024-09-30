/**
 *
 */
export interface Callback<N extends Node> {
  (node: N): void;
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
export interface Hook<N extends Node> {
  hook(node: N): void;
}

/**
 *
 */
export interface Mutable<V> {
  value: V;
}

/**
 *
 */
export interface Observable<V> {
  add(observer: Observer<V>): Disposable;
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
export type Option<N extends Node> =
  | [() => unknown, ...Observable<unknown>[]]
  | bigint
  | boolean
  | Callback<N>
  | Hook<N>
  | Node
  | null
  | number
  | object[]
  | Partial<N>
  | string
  | symbol
  | undefined;

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
export function $(...options: unknown[]): DocumentFragment {
  const fragment = jot.createDocumentFragment();

  for (const option of options) {
    parse(option, fragment);
  }

  return fragment;
}

function parse(option: unknown, node: ParentNode): unknown {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "string":
      return node.append(option);
    case "function":
      return option(node);
    case "object": {
      if ("hook" in option && typeof option.hook === "function") {
        return option.hook(node);
      }

      if (option instanceof Node) {
        return node.append(option);
      }

      if (!(option instanceof Array)) {
        return Object.assign(node, option);
      }

      const [slot, ...dependencies] = option;

      if (typeof slot === "function") {
        return spy(slot, ...dependencies).hook(node);
      }

      if (!(node instanceof HTMLElement)) {
        return;
      }

      for (const attributes of option) {
        for (const [name, value] of Object.entries(attributes)) {
          if (value == null) {
            node.removeAttribute(name);
          } else {
            node.setAttribute(name, value == null ? "" : String(value));
          }
        }
      }

      return;
    }
  }

  node.append(String(option));
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
): Mutable<V> & Observable<V> & Hook<ParentNode> & Disposable {
  if (view == null) {
    view = (value) => value;
  }

  const observers = new Set<Observer<V>>();

  return {
    add(observer: Observer<V>) {
      observers.add(observer);

      return {
        dispose() {
          observers.delete(observer);
        },
      };
    },
    dispose() {
      observers.clear();
    },
    hook(node: ParentNode) {
      const start = jot.createTextNode("");
      const end = jot.createTextNode("");

      node.append(start, $(view(value)), end);

      observers.add((state) => {
        const range = jot.createRange();

        range.setStartAfter(start);
        range.setEndBefore(end);
        range.deleteContents();
        range.insertNode($(view(state)));
      });
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
 * @param spy
 * @param dependencies
 * @returns
 */
export function spy<V>(
  spy: () => V,
  ...dependencies: Observable<unknown>[]
): Mutable<V> & Observable<V> & Hook<ParentNode> & Disposable {
  const observable = use(spy());

  const observer = () => {
    observable.value = spy();
  };

  const disposables = dependencies.map((dependency) =>
    dependency.add(observer),
  );

  return Object.assign(observable, {
    dispose() {
      for (const disposable of disposables) {
        disposable.dispose();
      }

      observable.dispose();
    },
  });
}
