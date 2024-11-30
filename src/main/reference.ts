import { Function } from "./core.ts";

interface Dependency extends Function<Function, Function> {}

/**
 *
 */
export interface Disposable {
  [dispose](): void;
}

/**
 *
 */
export interface Reference<V> {
  value: V;
}

const dispose = Symbol();

/**
 *
 * @param node
 * @param disposable
 * @returns
 */
export function addDisposable<N extends Node>(
  node: N,
  disposable: Disposable,
): void {
  let disposeNode: Function;

  if (isDisposable(node)) {
    disposeNode = node[dispose];
  }

  Object.assign(node, {
    [dispose]() {
      if (disposeNode) {
        disposeNode();
      }

      disposable[dispose]();
    },
  });
}

/**
 *
 * @param nodes
 */
export function discard(...nodes: Node[]) {
  for (const node of nodes) {
    discard(...node.childNodes);

    if (isDisposable(node)) {
      node[dispose]();
    }
  }
}

/**
 *
 * @param target
 * @returns
 */
export function isDisposable(target: object): target is Disposable {
  return dispose in target;
}

const current: { dependencies?: Dependency[] } = {};

/**
 *
 * @param callback
 * @returns
 */
export function spy<V>(callback: Function<void, V>): Reference<V> & Disposable {
  const disposables: Function[] = [];
  const dependencies = current.dependencies;

  current.dependencies = [];

  const observer = () => {
    try {
      reference.value = callback();
    } catch (error) {
      console.error(error);
    }
  };

  let value: V;

  try {
    value = callback();

    for (const dependency of current.dependencies) {
      disposables.push(dependency(observer));
    }
  } finally {
    current.dependencies = dependencies;
  }

  const reference = use(value);
  const disposeReference = reference[dispose];

  return Object.assign(reference, {
    [dispose]() {
      disposeReference();

      for (const dispose of disposables) {
        dispose();
      }

      disposables.length = 0;
    },
  });
}

/**
 *
 * @param value
 * @returns
 */
export function use<V>(value: V): Reference<V> & Disposable {
  const callbacks = new Set<Function>();

  const dependency = (callback: Function) => (
    callbacks.add(callback),
    () => {
      callbacks.delete(callback);
    }
  );

  return {
    [dispose]() {
      callbacks.clear();
    },
    get value() {
      if (current.dependencies) {
        current.dependencies.push(dependency);
      }

      return value;
    },
    set value(next: V) {
      if (value === next) {
        return;
      }

      value = next;

      for (const callback of callbacks) {
        callback();
      }
    },
  };
}
