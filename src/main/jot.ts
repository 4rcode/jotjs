import { bind, type Stringer } from "./core.ts";
import { hook, isHook, type Hook } from "./hook.ts";
import { spy } from "./mutable.ts";
import { removeEventListeners } from "./on.ts";
import { isProperty, type Properties } from "./properties.ts";

/**
 *
 */
export type Option<N extends Node> =
  | Hook<N>
  | Node
  | Option<N>[]
  | Properties<N>
  | View
  | bigint
  | boolean
  | null
  | number
  | string
  | symbol
  | undefined
  | void;

/**
 *
 */
export interface View {
  (node: Node): Option<DocumentFragment>;
}

function apply<N extends Node>(node: N, option: Option<N>): unknown {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "function":
      return applyView(node, option);

    case "object":
      return applyObject(node, option);

    case "string":
      return node.appendChild(new Text(option));
  }

  node.appendChild(new Text(String(option)));
}

function applyObject<N extends Node>(
  node: N,
  option: Hook<N> | Node | Option<N>[] | Properties<N>,
): unknown {
  if (isNode(option)) {
    return node.appendChild(option);
  }

  if (isHook<N>(option)) {
    return option.hook(node);
  }

  if (Array.isArray(option)) {
    return jot(node, ...option);
  }

  for (const key in option) {
    const property = option[key];

    if (isProperty<N, typeof key>(property)) {
      apply(node, property.hook(key));
    } else {
      Object.assign(node, { [key]: property });
    }
  }
}

function applyView<N extends Node>(node: N, view: View): void {
  const start = new Text();
  const startRef = new WeakRef(start);
  const end = new Text();
  const endRef = new WeakRef(end);

  node.appendChild(start);
  node.appendChild(end);

  bind(
    start,
    spy(() => {
      const start = startRef.deref();
      const end = endRef.deref();

      if (!start || !end || !start.parentNode || !end.parentNode) {
        return;
      }

      const slot = fragment(view(start.parentNode));
      const range = new Range();

      range.setStartAfter(start);
      range.setEndBefore(end);

      const contents = range.extractContents();

      range.insertNode(slot);
      dispose(contents);
    }),
  );
}

/**
 *
 * @param nodes
 */
export function dispose(...nodes: Node[]): void {
  for (const node of nodes) {
    dispose(...node.childNodes);
    removeEventListeners(node);
    node.parentNode?.removeChild(node);
  }
}

/**
 *
 * @param options
 * @returns
 */
export function fragment(
  ...options: Option<DocumentFragment>[]
): DocumentFragment {
  return jot(new DocumentFragment(), ...options);
}

const counter = { value: 0n };

/**
 *
 * @returns
 */
export function id<E extends Element>(): Hook<E> & Stringer {
  const id = String(counter.value++);

  return Object.assign(
    hook<E>((element) => {
      element.id = id;
    }),
    {
      toString() {
        return id;
      },
    },
  );
}

function isNode(target: object): target is Node {
  return "nodeType" in target;
}

/**
 *
 * @param node
 * @param options
 * @returns
 */
export function jot<N extends Node>(node: N, ...options: Option<N>[]): N {
  for (const option of options) {
    apply(node, option);
  }

  return node;
}
