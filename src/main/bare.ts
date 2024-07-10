interface HTMLElementFactory<E extends HTMLElement = HTMLElement> {
  (...options: Option<E>[]): E;
}

type HTMLElementTagMap = HTMLElementTagNameMap & Record<string, HTMLElement>;

type Option<N extends Node> =
  | string
  | Node
  | Partial<N>
  | ((value: N) => void)
  | {
      jot(value: N): void;
    };

/**
 *
 * @param element
 * @param options
 * @returns
 */
export function clone<N extends ParentNode>(node: N, ...options: Option<N>[]) {
  return () => jot(node.cloneNode(true) as N, ...options);
}

/**
 *
 * @param tag
 * @param options
 * @returns
 */
export function jot<
  T extends keyof HTMLElementTagMap,
  E extends T extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[T]
    : HTMLElement,
>(tag: T, ...options: Option<E>[]): E;

/**
 *
 * @param node
 * @param options
 * @returns
 */
export function jot<N extends ParentNode>(node: N, ...options: Option<N>[]): N;

export function jot(
  element: string | ParentNode,
  ...options: Option<ParentNode>[]
): ParentNode {
  if (typeof element === "string") {
    return jot(document.createElement(element), ...options);
  }

  for (const option of options) {
    if (typeof option === "function") {
      option(element);
    } else if (typeof option === "object" && "jot" in option) {
      option.jot(element);
    } else if (typeof option === "string" || option instanceof Node) {
      element.append(option);
    } else {
      Object.assign(element, option);
    }
  }

  return element;
}

/**
 *
 */
export const tags = new Proxy(
  {} as {
    [Tag in keyof HTMLElementTagMap]: HTMLElementFactory<
      Tag extends keyof HTMLElementTagNameMap
        ? HTMLElementTagNameMap[Tag]
        : HTMLElement
    >;
  },
  {
    get(target, property, receiver) {
      if (typeof property === "string") {
        return (...options: Option<HTMLElement>[]) => jot(property, ...options);
      }

      return Reflect.get(target, property, receiver);
    },
  },
);
