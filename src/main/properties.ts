import { hook } from "./hook.ts";
import type { Option } from "./jot.ts";

/**
 *
 */
export type Properties<N extends Node> = {
  [K in keyof N]?: N[K] | Property<N, K>;
};

/**
 *
 */
export interface Property<N extends Node, K extends keyof N> {
  hook(key: K): Option<N>;
}

/**
 *
 */
export interface PropertyExpression<V> {
  (value: V): V | undefined | void;
}

/**
 *
 * @param target
 * @returns
 */
export function isProperty<N extends Node, K extends keyof N>(
  target: unknown,
): target is Property<N, K> {
  return target != null && typeof target === "object" && "hook" in target;
}

/**
 *
 * @param expression
 * @returns
 */
export function watch<N extends Node, K extends keyof N>(
  expression: PropertyExpression<N[K]>,
): Property<N, K> {
  return {
    hook(key: K) {
      return hook((node) => {
        const value = expression(node[key]);

        if (value !== undefined) {
          node[key] = value;
        }
      }, true);
    },
  };
}
