import { disposable, dispose, isDisposable } from "./disposable.ts";
import { getDocument } from "./document.ts";
import { spy } from "./observable.ts";

/**
 *
 */
export type Option<N extends ParentNode> =
  | (() => Option<ParentNode>)[]
  | ((node: N) => Option<N>)
  | bigint
  | boolean
  | Node
  | null
  | number
  | Properties<N>
  | string
  | symbol
  | undefined
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
export type Property<V> = ((value: V) => V | undefined | void)[];

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
  return jot(getDocument().createDocumentFragment(), ...options);
}

function apply<N extends ParentNode>(option: Option<N>, node: N): void {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "string":
      return node.append(option);

    case "function":
      return apply(option(node), node);

    case "object": {
      if (isNode(option)) {
        return node.append(option);
      }

      if (Array.isArray(option)) {
        const disposables = getDisposables(node);

        for (const callback of option) {
          const document = getDocument();
          const range = document.createRange();
          const start = document.createTextNode("");
          const end = document.createTextNode("");

          node.append(start, end);

          disposables.push(
            spy(() => {
              range.setStartAfter(start);
              range.setEndBefore(end);
              range.deleteContents();
              range.insertNode($(callback()));
            }),
          );
        }

        return;
      }

      for (const key in option) {
        const value = option[key];

        if (isProperty<N[typeof key]>(value)) {
          const disposables = getDisposables(node);

          for (const callback of value) {
            disposables.push(
              spy(() => {
                const value = callback(node[key]);

                if (value !== undefined) {
                  node[key] = value;
                }
              }),
            );
          }
        } else {
          Object.assign(node, { [key]: value });
        }
      }

      return;
    }
  }

  return node.append(String(option));
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
    apply(option, node);
  }

  return disposable(node, () => {
    for (const child of node.childNodes) {
      if (isDisposable(child)) {
        dispose();
      }
    }
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
      return jot(getDocument().createElement(property), ...options);
    };
  },
});
