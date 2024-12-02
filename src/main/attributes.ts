import { Function } from "./core.ts";
import { register } from "./dependency.ts";
import { spy } from "./mutable.ts";
import { hook, Hook } from "./tags.ts";

/**
 *
 */
export type Attribute = Function<
  string | null,
  bigint | boolean | null | number | object | string | symbol | undefined | void
>;

/**
 *
 */
export interface Attributes {
  [key: string]: Attribute | ReturnType<Attribute>;
}

function apply(
  element: Element,
  namespace: string | null | undefined,
  name: string,
  value: Attributes[string],
): void {
  namespace = namespace || null;

  if (value == null) {
    return element.removeAttributeNS(namespace, name);
  }

  if (typeof value !== "function") {
    return element.setAttributeNS(namespace, name, String(value));
  }

  register(
    element,
    spy(() => {
      const computed = value(element.getAttributeNS(namespace, name));

      if (computed == null) {
        return element.removeAttributeNS(namespace, name);
      }

      element.setAttributeNS(namespace, name, String(computed));
    }),
  );
}

/**
 *
 * @param attributes
 * @param namespace
 * @returns
 */
export function set(attributes: Attributes, namespace?: string): Hook<Element> {
  return {
    [hook](element) {
      for (const [name, value] of Object.entries(attributes)) {
        apply(element, namespace, name, value);
      }
    },
  };
}
