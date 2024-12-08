import { getDocument } from "./document.ts";
import { Function, spy } from "./mutable.ts";

/**
 *
 */
export interface Hook<N extends Node = Node>
  extends Array<Function<N, Option<N>>> {}

/**
 *
 */
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

/**
 *
 */
export type Properties<N> = {
  [P in keyof N]?: N[P] | Property<N[P]>;
};

/**
 *
 */
export type Property<V> = Function<V, V | undefined | void>[];

/**
 *
 */
export interface Stringer {
  toString(): string;
}

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
 */
export interface View<N extends Node = Node>
  extends Function<N, Option<ParentNode>> {}

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
  const start = new Comment();
  const end = new Comment();

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

      if (!node || !start || !end) {
        return;
      }

      const slot = fragment(view(node));
      const range = new Range();

      range.setStartAfter(start);
      range.setEndBefore(end);
      range.deleteContents();
      range.insertNode(slot);
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

    const reference = new WeakRef(node);

    for (const callback of value) {
      register(
        node,
        spy(() => {
          const node = reference.deref();

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
 *
 * @param options
 * @returns
 */
export function fragment(...options: Option<ParentNode>[]): ParentNode {
  return jot(getDocument().createDocumentFragment(), ...options);
}

let counter = 0n;

/**
 *
 * @returns
 */
export function id(): Hook<Element> & Stringer {
  const id = `x${counter++}`;

  return Object.assign(
    <Hook<Element>>[
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
 *
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
 *
 * @param key
 * @param value
 */
export function register(key: object, value: unknown) {
  const anchor = {};
  const symbol = Symbol();

  Object.assign(key, { [symbol]: anchor });
  dependencies.set(anchor, value);
}

/**
 *
 */
export const tags = new Proxy(<Tags>{}, {
  get(target, property, receiver) {
    if (typeof property === "string") {
      return (...options: Option<ParentNode>[]) => {
        return jot(getDocument().createElement(property), ...options);
      };
    }

    return Reflect.get(target, property, receiver);
  },
});
