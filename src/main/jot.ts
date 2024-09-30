/**
 *
 */
export interface Callback<N> {
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
export interface Hook<N> {
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
export type Option<N> =
  | [() => Option<ParentNode>, ...Observable<unknown>[]]
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
  | undefined
  | void;

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
export function $(...options: Option<ParentNode>[]): ParentNode {
  return jot(doc.createDocumentFragment(), ...options);
}

/**
 *
 * @param node
 * @param options
 * @returns
 */
export function jot<N extends ParentNode>(node: N, ...options: Option<N>[]): N {
  for (const option of options) {
    parse(option, node);
  }

  return node;
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

  return node.append(String(option));
}

let doc: Document = document;

/**
 *
 * @param document
 */
export function setDocument(document: Document): void {
  doc = document;
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

/**
 *
 */
export const tags = new Proxy(<Tags>{}, {
  get(target, property, receiver) {
    if (typeof property !== "string") {
      return Reflect.get(target, property, receiver);
    }

    return (...options: Option<ParentNode>[]) => {
      return jot(doc.createElement(property), ...options);
    };
  },
});

/**
 *
 * @param value
 * @param view
 * @returns
 */
export function use<V>(
  value: V,
  view?: (value: V) => Option<ParentNode>,
): Mutable<V> & Observable<V> & Hook<ParentNode> & Disposable {
  if (view == null) {
    view = (value) => value as Option<ParentNode>;
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
      const start = doc.createTextNode("");
      const end = doc.createTextNode("");

      node.append(start, $(view(value)), end);

      observers.add((state) => {
        const range = doc.createRange();

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
