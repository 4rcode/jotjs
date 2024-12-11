import type { Function } from "./core.ts";
import { bind } from "./core.ts";
import { spy } from "./mutable.ts";

/**
 *
 */
export type Properties<N extends Node> = {
  [K in keyof N]?: N[K] | Property<N, K, N[K]>;
};

/**
 *
 */
export type Property<N extends Node, K extends keyof N, _V extends N[K]> = {
  applyTo(node: N, key: K): void;
};

/**
 *
 * @param target
 * @returns
 */
export function isProperty<N extends Node, K extends keyof N, V extends N[K]>(
  target: unknown,
): target is Property<N, K, V> {
  return target != null && typeof target === "object" && "applyTo" in target;
}

/**
 *
 * @param callback
 */
export function put<N extends Node, K extends keyof N>(
  callback: Function<N[K], N[K] | undefined | void>,
): Property<N, K, N[K]> {
  return {
    applyTo(node: N, key: K) {
      const nodeRef = new WeakRef(node);

      bind(
        node,
        spy(() => {
          const node = nodeRef.deref();

          if (!node) {
            return;
          }

          const value = callback(node[key]);

          if (value !== undefined) {
            node[key] = value;
          }
        }),
      );
    },
  };
}
