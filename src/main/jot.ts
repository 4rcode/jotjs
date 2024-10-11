import { getDocument } from "./document.ts";
import { spy } from "./hooks.ts";
import { Option, Property, Tags } from "./types.ts";

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
      return apply(option(node), node);

    case "object": {
      if (isNode(option)) {
        return node.append(option);
      }

      if (!Array.isArray(option)) {
        for (const key in option) {
          const value: unknown = option[key];

          if (isProperty(value)) {
            const [view] = value;

            spy(() => {
              const value = view(node[key]);

              if (value !== undefined) {
                Object.assign(node, { [key]: value });
              }

              return value;
            });
          } else {
            Object.assign(node, { [key]: value });
          }
        }

        return;
      }

      for (const callback of option) {
        const document = getDocument();
        const start = document.createTextNode("");
        const end = document.createTextNode("");

        jot(node, start, end);

        spy(() => {
          console.log(callback());
          const range = document.createRange();

          range.setStartAfter(start);
          range.setEndBefore(end);
          range.deleteContents();
          range.insertNode($(callback()));
        });
      }

      return;
    }
  }

  return node.append(String(option));
}

function isNode(target: object): target is Node {
  return "nodeType" in target;
}

function isProperty(target: unknown): target is Property<unknown> {
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
