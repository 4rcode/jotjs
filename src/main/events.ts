import type { Hook } from "./jot.ts";

const listeners = new WeakMap<
  Node,
  [string, EventListenerOrEventListenerObject][]
>();

/**
 * @param node
 * @returns
 */
export function removeEventListeners(node: Node): void {
  for (const [type, listener] of (listeners.get(node) || [])) {
    node.removeEventListener(type, listener);
  }
}

/**
 * @param type
 * @param listener
 * @param options
 */
export function on<K extends keyof ElementEventMap>(
  type: K,
  listener: (this: Element, ev: ElementEventMap[K]) => unknown,
  options?: boolean | AddEventListenerOptions,
): Hook<Node>;

/**
 * @param type
 * @param listener
 * @param options
 */
export function on(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): Hook<Node> {
  return [(node) => {
    node.addEventListener(type, listener, options);

    if (listeners.get(node)?.push([type, listener]) == null) {
      listeners.set(node, [[type, listener]]);
    }
  }];
}
