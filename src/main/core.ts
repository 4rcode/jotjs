/**
 *
 */
export interface Function<V = void, R = void> {
  (value: V): R;
}

/**
 *
 * @param nodes
 */
export function remove(...nodes: ChildNode[]) {
  for (const node of nodes) {
    remove(...node.childNodes);
    node.remove();
  }
}
