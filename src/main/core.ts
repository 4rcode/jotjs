const templates = new Map<Template, DocumentFragment>();

interface Template {
  raw: readonly string[] | ArrayLike<string>;
}

interface Hook {
  attach(node: Node): void;
  render?(ref: string): string;
}

export function attrs(values?: object) {
  const nodeRef = ref({
    attach() {
      if (values) {
        hook(values);
      }
    },
  });

  const hook = (values: object) => {
    const node = nodeRef();

    if (!(node instanceof Element)) {
      throw new Error("node must be an Element");
    }

    for (const [key, value] of Object.entries(values)) {
      node.setAttribute(key, value == null ? "" : String(value));
    }
  };

  return Object.assign(hook, nodeRef);
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
    const node = nodeRef();

    if (!(node instanceof Element)) {
      throw new Error("node must be an Element");
    }

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
 * @param nodes
 * @returns
 */
export function slot(...nodes: (string | Node)[]): Hook {
  return {
    attach(node: Node) {
      if (!(node instanceof Element)) {
        throw new Error("node must be an Element");
      }

      node.replaceWith(...nodes);
    },
    render(ref: string) {
      return `<br ${ref}/>`;
    },
  };
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
      case "symbol":
      case "undefined":
        return "";
      case "string":
        return item;
      case "bigint":
      case "boolean":
      case "number":
        return String(item);
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
    }
  });

  if (!templates.has(template)) {
    let i = 0;

    const placeholders = hooks.map((hook) => {
      if (typeof hook === "string") {
        return hook;
      }

      const ref = "x" + i++;

      if (hook.render) {
        return hook.render(ref);
      }

      return ref;
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

    const ref = "x" + i++;
    const element = node.querySelector(`[${ref}]`);

    if (!element) {
      throw new Error("element " + ref + " cannot be found");
    }

    element.removeAttribute(ref);
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

/**
 *
 * @param text
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
 * @param hooks
 * @returns
 */
export function ref(...hooks: Hook[]) {
  let ref: Node;

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
      ref = node;
      hook(...hooks);
    },
  });
}
