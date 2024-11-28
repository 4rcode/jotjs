import { Function } from "./core.ts";
import { spy } from "./reference.ts";
import { addDisposable, hook, Hook } from "./tags.ts";

/**
 *
 */
export type Attribute = Function<
  string | null,
  bigint | boolean | null | number | string | symbol | undefined | void
>;

/**
 *
 */
export interface Attributes {
  [key: string]:
    | Attribute
    | bigint
    | boolean
    | null
    | number
    | string
    | symbol
    | undefined
    | void;
}

/**
 *
 * @param attributes
 * @param namespace
 * @returns
 */
export function set(attributes: Attributes, namespace?: string): Hook<Element> {
  const ns = namespace || null;

  return {
    [hook](element) {
      for (const [name, value] of Object.entries(attributes)) {
        if (value == null) {
          element.removeAttributeNS(ns, name);
        } else if (typeof value === "function") {
          addDisposable(
            element,
            spy(() => {
              const computed = value(element.getAttributeNS(ns, name));

              if (computed == null) {
                element.removeAttributeNS(ns, name);
              } else {
                element.setAttributeNS(ns, name, String(computed));
              }
            }),
          );
        } else {
          element.setAttributeNS(ns, name, String(value));
        }
      }
    },
  };
}
