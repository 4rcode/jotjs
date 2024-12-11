import { type Hook, register } from "./jot.ts";
import { type Function, spy } from "./state.ts";

/** */
export type Attribute = Function<
  string | null,
  bigint | boolean | null | number | object | string | symbol | undefined | void
>;

/** */
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

  const reference = new WeakRef(element);

  register(
    element,
    spy(() => {
      const element = reference.deref();

      if (!element) {
        return;
      }

      const computed = value(element.getAttributeNS(namespace, name));

      if (computed == null) {
        return element.removeAttributeNS(namespace, name);
      }

      element.setAttributeNS(namespace, name, String(computed));
    }),
  );
}

/**
 * @param attributes
 * @param namespace
 * @returns
 */
export function set(attributes: Attributes, namespace?: string): Hook<Element> {
  return [
    (element) => {
      for (const [name, value] of Object.entries(attributes)) {
        apply(element, namespace, name, value);
      }
    },
  ];
}
