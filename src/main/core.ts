const PREFIX = "E";

const templates = new Map<Template, DocumentFragment>();

/**
 *
 */
export interface Hook<E extends Element = HTMLElement> {
  (element: E): void;
}

interface Template {
  raw: readonly string[] | ArrayLike<string>;
}

/**
 *
 * @param template
 * @param substitutions
 * @returns
 */
export function html(
  template: Template,
  ...substitutions: unknown[]
): DocumentFragment {
  const hooks = substitutions.map((item) => {
    if (typeof item === "function") {
      return {
        attach(element: Element) {
          item(element);
        },
        query(fragment: DocumentFragment, attribute: string) {
          return fragment.querySelector(`[${attribute}]`);
        },
        render(attribute: string) {
          return ` ${attribute} `;
        },
      };
    }

    return {
      attach(element: Element) {
        element.replaceWith(...nodes(item));
      },
      query(fragment: DocumentFragment, id: string) {
        return fragment.getElementById(id);
      },
      render(id: string) {
        return `<br id="${id}"/>`;
      },
    };
  });

  if (!templates.has(template)) {
    let i = 0;

    templates.set(
      template,
      document.createRange().createContextualFragment(
        String.raw(
          template,
          ...hooks.map((hook) => {
            return hook.render(PREFIX + i++);
          }),
        ),
      ),
    );
  }

  const fragment = templates.get(template);

  if (!fragment) {
    throw new Error("fragment cannot be undefined");
  }

  const node = fragment.cloneNode(true) as DocumentFragment;

  let i = 0;

  for (const hook of hooks) {
    const id = PREFIX + i++;
    const element = hook.query(node, id);

    if (!element) {
      throw new Error(`element ${id} cannot be found"`);
    }

    element.removeAttribute(id);
    hook.attach(element);
  }

  return node;
}

function nodes(node: unknown): (string | Node)[] {
  if (typeof node === "string" || node instanceof Node) {
    return [node];
  }

  if (node instanceof Array) {
    return node.flatMap((node) => nodes(node));
  }

  return [String(node)];
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
): Hook<E>;

/**
 *
 * @param type
 * @param listener
 * @param options
 * @returns
 */
export function on<E extends Element = HTMLElement>(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): Hook<E>;

export function on<E extends Element = HTMLElement>(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): Hook<E> {
  return (element) => {
    element.addEventListener(type, listener, options);
  };
}

/**
 *
 * @param attributes
 * @returns
 */
export function put<E extends Element = HTMLElement>(
  attributes: object,
): Hook<E> {
  return (element) => {
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value == null ? "" : String(value));
    }
  };
}

/**
 *
 * @param callbacks
 * @returns
 */
export function ref<E extends Element = HTMLElement>(
  ...callbacks: Hook<E>[]
): [E, (...hooks: Hook<E>[]) => E] {
  let ref: E;

  return [
    new Proxy(
      (element: E) => {
        ref = element;

        for (const callback of callbacks) {
          callback(ref);
        }
      },
      {
        get(_, property) {
          const value = Reflect.get(ref, property, ref);

          if (typeof value === "function") {
            return value.bind(ref);
          }

          return value;
        },
        set(_, property, value) {
          return Reflect.set(ref, property, value, ref);
        },
      },
    ) as unknown as E,
    (...callbacks: Hook<E>[]) => {
      if (ref == null) {
        callbacks.push(...callbacks);

        return ref;
      }

      for (const callback of callbacks) {
        callback(ref);
      }

      return ref;
    },
  ];
}

/**
 *
 * @param properties
 * @returns
 */
export function set<E extends Element = HTMLElement>(
  properties: Partial<E>,
): Hook<E> {
  return (element) => {
    Object.assign(element, properties);
  };
}
