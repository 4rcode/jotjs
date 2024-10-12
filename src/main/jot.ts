import { getDocument } from "./document.ts";
import { spy } from "./hooks.ts";
import type { Function } from "./types.ts";
import { Option, Property, Tags } from "./types.ts";

interface Disposable {
  [disposables]: Function<void>[];
}

const disposables = Symbol();

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
        for (const callback of option) {
          const document = getDocument();
          const range = document.createRange();
          const start = document.createTextNode("");
          const end = document.createTextNode("");

          node.append(start, end);

          spy(() => {
            range.setStartAfter(start);
            range.setEndBefore(end);
            range.deleteContents();
            range.insertNode($(callback()));
          });
        }

        return;
      }

      for (const key in option) {
        const value = option[key];

        if (isProperty<N[typeof key]>(value)) {
          const garbage = isDisposable(node)
            ? node
            : Object.assign(node, { [disposables]: [] });

          for (const callback of value) {
            garbage[disposables].push(
              spy(() => {
                const value = callback(node[key]);

                if (value !== undefined) {
                  Object.assign(node, { [key]: value });
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

export function dispose(...nodes: ParentNode[]) {
  for (const node of nodes) {
    dispose(...node.children);

    if (isDisposable(node)) {
      for (const disposable of node[disposables]) {
        disposable();
      }
    }
  }
}

function isDisposable(target: object): target is Disposable {
  return disposables in target;
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
