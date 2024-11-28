import { Function } from "./core.ts";
import { Disposable, dispose, isDisposable } from "./disposable.ts";
import { getDocument } from "./document.ts";
import { spy } from "./reference.ts";

/**
 *
 */
export interface Hook<N extends ParentNode> {
  [hook](node: N): Option<N>;
}

/**
 *
 */
export type Option<N extends ParentNode> =
  | Function<N, Option<N>>[]
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
export type Tags = {
  [T in keyof HTMLElementTagNameMap]: (
    ...options: Option<HTMLElementTagNameMap[T]>[]
  ) => HTMLElementTagNameMap[T];
};

/**
 *
 */
export interface View<N extends Node> extends Function<N, Option<ParentNode>> {}

/**
 *
 * @param options
 * @returns
 */
export function $(...options: Option<ParentNode>[]): ParentNode {
  return jot(getDocument().createDocumentFragment(), ...options);
}

/**
 *
 * @param node
 * @param disposable
 * @returns
 */
export function addDisposable<N extends Node>(
  node: N,
  disposable: Disposable,
): N {
  let disposeNode: Function;

  if (isDisposable(node)) {
    disposeNode = node[dispose];
  }

  return Object.assign(node, {
    [dispose]() {
      if (disposeNode) {
        disposeNode();
      }

      disposable[dispose]();
    },
  });
}

function apply<N extends ParentNode>(node: N, option: Option<N>): void {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "string":
      return node.append(option);

    case "function": {
      const document = getDocument();
      const range = document.createRange();
      const start = document.createTextNode("");
      const end = document.createTextNode("");

      node.append(start, end);

      addDisposable(
        node,
        spy(() => {
          range.setStartAfter(start);
          range.setEndBefore(end);
          range.deleteContents();
          range.insertNode($(option(node)));
        }),
      );

      return;
    }

    case "object": {
      if (isNode(option)) {
        return node.append(option);
      }

      if (isHook<N>(option)) {
        return apply(node, option[hook](node));
      }

      if (Array.isArray(option)) {
        for (const callback of option) {
          apply(node, callback(node));
        }
      } else {
        for (const key in option) {
          const value = option[key];

          if (isProperty<N[typeof key]>(value)) {
            for (const callback of value) {
              spy(() => {
                const value = callback(node[key]);

                if (value !== undefined) {
                  node[key] = value;
                }
              });
            }
          } else {
            Object.assign(node, { [key]: value });
          }
        }
      }

      return;
    }
  }

  return node.append(String(option));
}

/**
 *
 * @param nodes
 */
export function discard(...nodes: Node[]) {
  for (const node of nodes) {
    discard(...node.childNodes);

    if (isDisposable(node)) {
      node[dispose]();
    }
  }
}

/**
 *
 */
export const hook = Symbol();

/**
 *
 * @param target
 * @returns
 */
export function isHook<N extends ParentNode>(
  target: object,
): target is Hook<N> {
  return hook in target;
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

/**
 *
 */
export const tags = new Proxy(<Tags>{}, {
  get(target, property, receiver) {
    if (typeof property !== "string") {
      return Reflect.get(target, property, receiver);
    }

    return (...options: Option<ParentNode>[]) => {
      return jot(getDocument().createElement(property), ...options);
    };
  },
});
