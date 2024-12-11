import { getDocument } from "./document.ts";
import { jot, type Option } from "./jot.ts";

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
export const tags: Tags = new Proxy(<Tags>{}, {
  get(target, property, receiver) {
    if (typeof property === "string") {
      return (...options: Option<Node>[]) => {
        return jot(getDocument().createElement(property), ...options);
      };
    }

    return Reflect.get(target, property, receiver);
  },
});
