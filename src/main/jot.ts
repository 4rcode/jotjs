import { removeEventListeners } from "./events.ts";
import { type Function, spy } from "./state.ts";

/** */
export interface Hook<N extends Node = Node>
  extends Array<Function<N, Option<N>>> {}

/** */
export type Option<N extends Node = Node> =
  | bigint
  | boolean
  | Hook<N>
  | Node
  | null
  | number
  | Properties<N>
  | string
  | symbol
  | undefined
  | View<N>
  | void;

/** */
export type Properties<N> = {
  [P in keyof N]?: N[P] | Property<N[P]>;
};

/** */
export type Property<V> = Function<V, V | undefined | void>[];

/** */
export interface Stringer {
  toString(): string;
}

/** */
export type Tags = {
  [T in keyof HTMLElementTagNameMap]: (
    ...options: Option<HTMLElementTagNameMap[T]>[]
  ) => HTMLElementTagNameMap[T];
};

/** */
export interface View<N extends Node = Node>
  extends Function<N, Option<DocumentFragment>> {}

function apply<N extends ParentNode>(node: N, option: Option<N>): void {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "string":
      return node.append(option);

    case "function":
      return applyFunction(node, option);

    case "object":
      return applyObject(node, option);
  }

  return node.append(String(option));
}

function applyFunction<N extends ParentNode>(node: N, view: View<N>): void {
  const start = new Text();
  const end = new Text();

  node.append(start, end);

  const nodeRef = new WeakRef(node);
  const startRef = new WeakRef(start);
  const endRef = new WeakRef(end);

  return register(
    node,
    spy(() => {
      const node = nodeRef.deref();
      const start = startRef.deref();
      const end = endRef.deref();

      if (!node || !start || !end || !start.parentNode || !end.parentNode) {
        return;
      }

      const slot = fragment(view(node));
      const range = new Range();

      range.setStartAfter(start);
      range.setEndBefore(end);

      const contents = range.extractContents();

      range.insertNode(slot);
      dispose(contents);
    }),
  );
}

function applyObject<N extends ParentNode>(
  node: N,
  option: Function<N, Option<N>>[] | Hook<N> | Node | Properties<N>,
): void {
  if (isNode(option)) {
    return node.append(option);
  }

  if (Array.isArray(option)) {
    for (const callback of option) {
      apply(node, callback(node));
    }

    return;
  }

  for (const key in option) {
    const value = option[key];

    if (!isProperty<N[typeof key]>(value)) {
      Object.assign(node, { [key]: value });
      continue;
    }

    const nodeRef = new WeakRef(node);

    for (const callback of value) {
      register(
        node,
        spy(() => {
          const node = nodeRef.deref();

          if (!node) {
            return;
          }

          const value = callback(node[key]);

          if (value !== undefined) {
            node[key] = value;
          }
        }),
      );
    }
  }
}

/**
 * @param nodes
 */
export function dispose(...nodes: Node[]): void {
  for (const node of nodes) {
    dispose(...node.childNodes);
    removeEventListeners(node);
    node.parentNode?.removeChild(node);
  }
}

/**
 * @param options
 * @returns
 */
export function fragment(
  ...options: Option<DocumentFragment>[]
): DocumentFragment {
  return jot(getDocument().createDocumentFragment(), ...options);
}

const current = { document };

/**
 * @returns
 */
export function getDocument(): Document {
  return current.document;
}

/**
 * @param document
 */
export function setDocument(document: Document): void {
  current.document = document;
}

let counter = 0n;

/**
 * @returns
 */
export function id(): Hook<Element> & Stringer {
  const id = `x${counter++}`;

  return Object.assign(
    <Hook<Element>> [
      (element) => {
        element.id = id;
      },
    ],
    {
      toString() {
        return id;
      },
    },
  );
}

function isNode(target: object): target is Node {
  return "nodeType" in target;
}

function isProperty<V>(target: unknown): target is Property<V> {
  return Array.isArray(target) && typeof target[0] === "function";
}

/**
 * @param node
 * @param options
 * @returns
 */
export function jot<N extends ParentNode>(node: N, ...options: Option<N>[]): N {
  for (const option of options) {
    apply(node, option);
  }

  return node;
}

const dependencies = new WeakMap();

/**
 * @param key
 * @param value
 */
export function register(key: object, value: unknown) {
  const anchor = {};

  Object.assign(key, { [Symbol()]: anchor });
  dependencies.set(anchor, value);
}

/** */
export const tags: Tags = new Proxy(<Tags> {}, {
  get(target, property, receiver) {
    if (typeof property === "string") {
      return (...options: Option<ParentNode>[]) => {
        return jot(getDocument().createElement(property), ...options);
      };
    }

    return Reflect.get(target, property, receiver);
  },
});
