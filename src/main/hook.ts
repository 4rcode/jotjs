import { bind } from "./core.ts";
import type { Option } from "./jot.ts";
import { jot } from "./jot.ts";
import { spy } from "./mutable.ts";

/**
 *
 */
export interface Hook<N extends Node> {
  hook(node: N): void;
}

/**
 *
 * @param callback
 * @param reactive
 * @returns
 */
export function hook<N extends Node>(
  callback: (node: N) => Option<N>,
  reactive?: boolean,
): Hook<N> {
  return {
    hook(node: N) {
      if (reactive) {
        bind(
          node,
          spy(() => jot(node, callback(node))),
        );
      } else {
        jot(node, callback(node));
      }
    },
  };
}

/**
 *
 * @param target
 * @returns
 */
export function isHook<N extends Node>(target: object): target is Hook<N> {
  return "hook" in target;
}
