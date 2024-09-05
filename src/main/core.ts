const PREFIX = "x";
const templates = new Map<Template, DocumentFragment>();

interface Hook {
  attach(node: Node): void;
  render?(reference: string): string;
}

interface Template {
  raw: readonly string[] | ArrayLike<string>;
}

export function add(...nodes: unknown[]) {
  let ref: Node;

  const action = (...nodes: unknown[]) => {
    narrow(ref).append(...nodes.map(toSafeNode));
  };

  return Object.assign(action, {
    attach(node: Node) {
      ref = node;
      action(...nodes);
    },
  });
}

/**
 *
 * @param attributes
 * @returns
 */
export function attrs(attributes?: object) {
  let ref: Node;

  const action = (attributes: object) => {
    const node = narrow(ref);

    for (const [key, value] of Object.entries(attributes)) {
      node.setAttribute(key, value == null ? "" : String(value));
    }
  };

  return Object.assign(action, {
    attach(node: Node) {
      ref = node;

      if (attributes) {
        action(attributes);
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
  let ref: Node;

  const action = (...names: string[]) => {
    const node = narrow(ref);

    for (const name of names) {
      for (const token of name.split(/\s+/)) {
        node.classList.add(token);
      }
    }
  };

  return Object.assign(action, {
    attach(node: Node) {
      ref = node;
      action(...names);
    },
  });
}

/**
 *
 * @param nodes
 * @returns
 */
export function fragment(...nodes: unknown[]) {
  const fragment = document.createDocumentFragment();

  fragment.append(...nodes.map(toSafeNode));

  return fragment;
}

/**
 *
 * @param node
 * @param hooks
 * @returns
 */
export function hook<N extends Node>(node: Node, ...hooks: Hook[]) {
  const action = (...hooks: Hook[]) => {
    for (const hook of hooks) {
      hook.attach(node);
    }

    return node as N;
  };

  action(...hooks);

  return action;
}

/**
 *
 * @param template
 * @param substitutions
 * @returns
 */
export function html(template: Template, ...substitutions: unknown[]) {
  const hooks: Hook[] = substitutions.map((item) => {
    switch (typeof item) {
      case "function":
      case "object":
        if (item == null) {
          return slot(item);
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
    }

    return slot(item);
  });

  if (!templates.has(template)) {
    let i = 0;

    const placeholders = hooks.map((hook) => {
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
 * @param node
 * @returns
 */
export function narrow<E extends Element>(node: Node) {
  if (node instanceof Element) {
    return node as E;
  }

  throw new Error("node must be an Element");
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
  return {
    attach(node) {
      node.addEventListener(type, listener, options);
    },
  };
}

export function props<N extends Node>(properties?: Partial<N>) {
  let ref: Node;

  const hook = (properties: Partial<N>) => {
    Object.assign(ref, properties);
  };

  return Object.assign(hook, {
    attach(node: Node) {
      ref = node;
      if (properties) {
        hook(properties);
      }
    },
  });
}

export function put(...nodes: unknown[]) {
  let ref: Node;

  const action = (...nodes: unknown[]) => {
    narrow(ref).replaceChildren(...nodes.map(toSafeNode));
  };

  return Object.assign(action, {
    attach(node: Node) {
      ref = node;
      action(...nodes);
    },
  });
}

/**
 *
 * @param hooks
 * @returns
 */
export function ref<N extends Node>(...hooks: Hook[]) {
  let ref: (...hooks: Hook[]) => N;

  const action = (...hooks: Hook[]) => {
    if (ref == null) {
      throw new Error("ref cannot be null");
    }

    return ref(...hooks);
  };

  return Object.assign(action, {
    attach(node: Node) {
      ref = hook(node as N, ...hooks);
    },
  });
}

/**
 *
 * @param nodes
 * @returns
 */
export function slot(...nodes: unknown[]): Hook {
  return {
    attach(node: Node) {
      narrow(node).replaceWith(...nodes.map(toSafeNode));
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

  const action = (value: unknown) => {
    text.textContent = value == null ? null : String(value);
  };

  action(value);

  return Object.assign(action, slot(text));
}

/**
 *
 * @param node
 * @returns
 */
export function toSafeNode(node: unknown) {
  if (typeof node === "string") {
    return node;
  }

  if (node instanceof Node) {
    return node;
  }

  return String(node);
}
