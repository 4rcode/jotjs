const PREFIX = "x";
const templates = new Map<Template, DocumentFragment>();

interface Hook {
  attach(node: Node): void;
  render?(reference: string): string;
}

interface Template {
  raw: readonly string[] | ArrayLike<string>;
}

export function add(...nodes: (string | Node)[]) {
  let ref: Node;

  const hook = (...nodes: (string | Node)[]) => {
    element(ref).append(...nodes);
  };

  return Object.assign(hook, {
    attach(node: Node) {
      ref = node;
      hook(...nodes);
    },
  });
}

/**
 *
 * @param values
 * @returns
 */
export function attrs(values?: object) {
  let ref: Node;

  const hook = (values: object) => {
    const node = element(ref);

    for (const [key, value] of Object.entries(values)) {
      node.setAttribute(key, value == null ? "" : String(value));
    }
  };

  return Object.assign(hook, {
    attach(node: Node) {
      ref = node;

      if (values) {
        hook(values);
      }
    },
  });
}

/**
 *
 * @param names
 * @returns
 */
export function className(...names: string[]) {
  const nodeRef = ref({
    attach() {
      hook(...names);
    },
  });

  const hook = (...names: string[]) => {
    const node = element(nodeRef());

    for (const name of names) {
      const tokens = name.split(/\s+/);

      for (const token of tokens) {
        node.classList.add(token);
      }
    }
  };

  return Object.assign(hook, nodeRef);
}

/**
 *
 * @param node
 * @returns
 */
export function element<E extends Element>(node: Node) {
  if (node instanceof Element) {
    return node as E;
  }

  throw new Error("node must be an Element");
}

/**
 *
 * @param nodes
 * @returns
 */
export function fragment(...nodes: (string | Node)[]) {
  const fragment = document.createDocumentFragment();

  fragment.append(...nodes);

  return fragment;
}

/**
 *
 * @param hooks
 * @returns
 */
export function func(...hooks: ((node: Node) => void)[]) {
  const nodeRef = ref({
    attach() {
      hook(...hooks);
    },
  });

  const hook = (...hooks: ((node: Node) => void)[]) => {
    const node = nodeRef();

    for (const hook of hooks) {
      hook(node);
    }
  };

  return Object.assign(hook, nodeRef);
}

/**
 *
 * @param template
 * @param substitutions
 * @returns
 */
export function html(template: Template, ...substitutions: unknown[]) {
  const hooks: (string | Hook)[] = substitutions.map((item) => {
    switch (typeof item) {
      case "function":
      case "object":
        if (item == null) {
          return "";
        }

        if ("attach" in item) {
          return item as Hook;
        }

        if (item instanceof Node) {
          return slot(item);
        }

        if (item instanceof Function) {
          return {
            attach(node) {
              item(node);
            },
          };
        }

        return attrs(item);
      default:
        return slot(String(item));
    }
  });

  if (!templates.has(template)) {
    let i = 0;

    const placeholders = hooks.map((hook) => {
      if (typeof hook === "string") {
        return hook;
      }

      const reference = PREFIX + i++;

      if (hook.render) {
        return hook.render(reference);
      }

      return reference;
    });

    const text = String.raw(template, ...placeholders);
    const fragment = document.createRange().createContextualFragment(text);

    templates.set(template, fragment);
  }

  const fragment = templates.get(template);

  if (!fragment) {
    throw new Error("fragment cannot be undefined");
  }

  const node = fragment.cloneNode(true) as DocumentFragment;

  let i = 0;

  for (const hook of hooks) {
    if (typeof hook === "string") {
      continue;
    }

    const reference = PREFIX + i++;
    const element = node.querySelector(`[${reference}]`);

    if (!element) {
      throw new Error("element " + ref + " cannot be found");
    }

    element.removeAttribute(reference);
    hook.attach(element);
  }

  return node;
}

/**
 *
 * @param type
 * @param listener
 * @param options
 * @returns
 */
export function on<E extends HTMLElement, T extends keyof HTMLElementEventMap>(
  type: T,
  listener: (this: E, event: HTMLElementEventMap[T]) => void,
  options?: boolean | AddEventListenerOptions,
): Hook;

/**
 *
 * @param type
 * @param listener
 * @param options
 * @returns
 */
export function on(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): Hook;

export function on(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): Hook {
  return func((node: Node) => node.addEventListener(type, listener, options));
}

export function props<T extends keyof HTMLElementTagNameMap>(
  _tag: T,
  values?: Partial<HTMLElementTagNameMap[T]>,
) {
  const nodeRef = ref({
    attach() {
      if (values) {
        hook(values);
      }
    },
  });

  const hook = (values: Partial<HTMLElementTagNameMap[T]>) => {
    Object.assign(nodeRef(), values);
  };

  return Object.assign(hook, nodeRef);
}

export function put(...nodes: (string | Node)[]) {
  const nodeRef = ref({
    attach() {
      hook(...nodes);
    },
  });

  const hook = (...nodes: (string | Node)[]) => {
    element(nodeRef()).replaceChildren(...nodes);
  };

  return Object.assign(hook, nodeRef);
}

/**
 *
 * @param hooks
 * @returns
 */
export function ref<N extends Node>(...hooks: Hook[]) {
  let ref: N;

  const hook = (...hooks: Hook[]) => {
    if (ref == null) {
      throw new Error("ref cannot be null");
    }

    for (const hook of hooks) {
      hook.attach(ref);
    }

    return ref;
  };

  return Object.assign(hook, {
    attach(node: Node) {
      ref = node as N;
      hook(...hooks);
    },
  });
}

/**
 *
 * @param nodes
 * @returns
 */
export function slot(...nodes: (string | Node)[]): Hook {
  return {
    attach(node: Node) {
      element(node).replaceWith(...nodes);
    },
    render(ref: string) {
      return `<br ${ref}/>`;
    },
  };
}

/**
 *
 * @param value
 * @returns
 */
export function text(value?: unknown) {
  const text = document.createTextNode("");

  const hook = (value: unknown) => {
    text.textContent = value == null ? null : String(value);
  };

  hook(value);

  return Object.assign(hook, slot(text));
}
