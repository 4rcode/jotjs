interface Template {
  raw: readonly string[] | ArrayLike<string>;
}

/**
 *
 * @param name
 * @param value
 * @returns
 */
export function attr(
  name: string,
  value?: unknown,
): Attr & { set(value?: unknown): void };

/**
 *
 * @param name
 * @param value
 * @returns
 */
export function attr<E extends Element>(
  map: Record<string, unknown>,
): (element: E) => void;

export function attr<E extends Element>(
  key: string | Record<string, unknown>,
  value?: unknown,
): unknown {
  if (typeof key === "string") {
    const attr = Object.assign(document.createAttribute(key), {
      jot(element: E) {
        element.setAttributeNode(attr);
      },
      set(value?: unknown) {
        attr.textContent = value == null ? null : String(value);
      },
    });

    attr.set(value);

    return attr;
  }

  return (element: E) => {
    for (const name in key) {
      const value = key[name];
      element.setAttribute(name, value == null ? "" : String(value));
    }
  };
}

/**
 *
 * @param names
 * @returns
 */
export function className<E extends Element>(...names: string[]) {
  return (element: E) => {
    for (const name of names) {
      const tokens = name.split(/\s+/);

      for (const token of tokens) {
        element.classList.add(token);
      }
    }
  };
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
 * @param template
 * @param substitutions
 * @returns
 */
export function html(template: Template, ...substitutions: unknown[]) {
  return document
    .createRange()
    .createContextualFragment(String.raw(template, ...substitutions));
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
): (element: E) => void;

/**
 *
 * @param type
 * @param listener
 * @param options
 * @returns
 */
export function on<E extends HTMLElement>(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): (element: E) => void;

export function on(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  return (element: HTMLElement) =>
    element.addEventListener(type, listener, options);
}

/**
 *
 * @param text
 * @returns
 */
export function text(value?: unknown) {
  const text = Object.assign(document.createTextNode(""), {
    set(value?: unknown) {
      text.textContent = value == null ? null : String(value);
    },
  });

  text.set(value);

  return text;
}
