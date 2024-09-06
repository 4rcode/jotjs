const PREFIX = "x";
const templates = new Map<Template, DocumentFragment>();

/**
 *
 */
export interface Hook {
  jot: {
    attach(element: Element): void;
    render?(reference: string): string;
  };
}

/**
 *
 */
export interface Template {
  raw: readonly string[] | ArrayLike<string>;
}

/**
 *
 * @param attributes
 * @returns
 */
export function attr(attributes?: object) {
  let ref: Element;

  const action = (attributes: object) => {
    for (const [name, value] of Object.entries(attributes)) {
      ref.setAttribute(name, value == null ? "" : String(value));
    }
  };

  return Object.assign(action, <Hook>{
    jot: {
      attach(element) {
        ref = element;

        if (attributes) {
          action(attributes);
        }
      },
    },
  });
}

/**
 *
 * @param names
 * @returns
 */
export function className(
  strategy: "add" | "remove" | "toggle",
  ...names: string[]
) {
  let ref: Element;

  const action = (...names: string[]) => {
    for (const name of names) {
      for (const token of name.split(/\s+/)) {
        switch (strategy) {
          case "add":
            ref.classList.add(token);
            continue;
          case "remove":
            ref.classList.remove(token);
            continue;
          case "toggle":
            ref.classList.toggle(token);
            continue;
        }
      }
    }
  };

  return Object.assign(action, <Hook>{
    jot: {
      attach(element) {
        ref = element;
        action(...names);
      },
    },
  });
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

        if ("jot" in item) {
          return item as Hook;
        }

        if (item instanceof Node) {
          return slot(item);
        }

        if (item instanceof Function) {
          return <Hook>{
            jot: {
              attach(node) {
                item(node);
              },
            },
          };
        }

        return attr(item);
    }

    return slot(item);
  });

  if (!templates.has(template)) {
    let i = 0;

    const placeholders = hooks.map((hook) => {
      const reference = PREFIX + i++;

      if (hook.jot.render) {
        return hook.jot.render(reference);
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
    const reference = PREFIX + i++;
    const element = node.querySelector(`[${reference}]`);

    if (!element) {
      throw new Error("element " + ref + " cannot be found");
    }

    element.removeAttribute(reference);
    hook.jot.attach(element);
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
export function on<
  T extends keyof HTMLElementEventMap,
  E extends HTMLElement = HTMLElement,
>(
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
) {
  return <Hook>{
    jot: {
      attach(element) {
        element.addEventListener(type, listener, options);
      },
    },
  };
}

/**
 *
 * @param hooks
 * @returns
 */
export function ref<E extends Element = HTMLElement>(...hooks: Hook[]) {
  let ref: Element;

  return new Proxy(
    {
      jot: {
        attach(element) {
          ref = element;

          for (const hook of hooks) {
            hook.jot.attach(element);
          }
        },
      },
    } as E & Hook,
    {
      get(target, property, receiver) {
        if (property === "jot") {
          return Reflect.get(target, property, receiver);
        }

        return Reflect.get(ref, property, ref);
      },
      set(_, property, value) {
        if (property === "jot") {
          return false;
        }

        return Reflect.set(ref, property, value, ref);
      },
    },
  );
}

/**
 *
 * @param properties
 * @returns
 */
export function set<E extends Element = HTMLElement>(properties?: Partial<E>) {
  let ref: Element;

  const action = (properties: Partial<E>) => {
    Object.assign(ref, properties);
  };

  return Object.assign(action, <Hook>{
    jot: {
      attach(element) {
        ref = element;

        if (properties) {
          action(properties);
        }
      },
    },
  });
}

/**
 *
 * @param nodes
 * @returns
 */
export function slot(...nodes: unknown[]) {
  return <Hook>{
    jot: {
      attach(element) {
        element.replaceWith(...nodes.map(toNode));
      },
      render(ref) {
        return `<br ${ref}/>`;
      },
    },
  };
}

/**
 *
 * @param node
 * @returns
 */
export function toNode(node: unknown) {
  if (typeof node === "string") {
    return node;
  }

  if (node instanceof Node) {
    return node;
  }

  return String(node);
}

/**
 *
 * @param nodes
 * @returns
 */
export function wrap(...nodes: unknown[]) {
  const fragment = document.createDocumentFragment();

  fragment.append(...nodes.map(toNode));

  return fragment;
}
