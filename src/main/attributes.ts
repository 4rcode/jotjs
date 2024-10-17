import { disposable } from "./disposable.ts";
import { spy } from "./observable.ts";

/**
 *
 */
export type Attribute = ((
  value: string | null,
) => bigint | boolean | null | number | string | symbol | undefined | void)[];

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
 */
export function set(
  attributes: Attributes,
  namespace?: string,
): (element: Element) => void {
  const ns = namespace || null;

  return (element) => {
    for (const [name, value] of Object.entries(attributes)) {
      if (value == null) {
        element.removeAttributeNS(ns, name);
      } else if (Array.isArray(value)) {
        for (const callback of value) {
          disposable(
            element,
            spy(() => {
              const value = callback(element.getAttributeNS(ns, name));

              if (value == null) {
                element.removeAttributeNS(ns, name);
              } else {
                element.setAttributeNS(ns, name, String(value));
              }
            }),
          );
        }
      } else {
        element.setAttributeNS(ns, name, String(value));
      }
    }
  };
}
