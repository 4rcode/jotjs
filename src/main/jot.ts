import { getDocument } from "./document.ts";
import { spy } from "./hooks.ts";
import { Hook, nil, Option, Property, Tags, View } from "./types.ts";

/**
 *
 * @param options
 * @returns
 */
export function $(...options: Option<ParentNode>[]): ParentNode {
  return jot(getDocument().createDocumentFragment(), ...options);
}

function apply<N extends ParentNode>(option: Option<N>, node: N): unknown {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "string":
      return node.append(option);

    case "function":
      return option(node);

    case "object": {
      if (isHook<N>(option)) {
        return option.hook(node);
      }

      if (isNode(option)) {
        return node.append(option);
      }

      if (!Array.isArray(option)) {
        for (const key in option) {
          const value: unknown = option[key];

          if (isProperty(value)) {
            const [view, ...dependencies] = value;

            spy(() => {
              const value = view(node[key]);

              if (value !== nil) {
                Object.assign(node, { [key]: value });
              }

              return value;
            }, dependencies);
          } else {
            Object.assign(node, { [key]: value });
          }
        }

        return;
      }

      if (isView(option)) {
        const [view, ...dependencies] = option;

        return spy(view, dependencies).hook(node);
      }

      if (!isElement(node)) {
        return;
      }

      for (const attributes of option) {
        for (const [name, value] of Object.entries(attributes)) {
          if (value == null) {
            node.removeAttribute(name);
          } else {
            node.setAttribute(name, String(value));
          }
        }
      }

      return;
    }
  }

  return node.append(String(option));
}

function isElement(target: object): target is Element {
  return "setAttribute" in target;
}

function isHook<N extends ParentNode>(target: object): target is Hook<N> {
  return "hook" in target;
}

function isNode(target: object): target is Node {
  return "append" in target;
}

function isProperty(target: unknown): target is Property<unknown> {
  return Array.isArray(target) && typeof target[0] === "function";
}

function isView(target: unknown[]): target is View {
  return typeof target[0] === "function";
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
