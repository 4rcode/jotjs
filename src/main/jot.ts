/**
 *
 */
export interface Hook<E extends Element = HTMLElement> {
  (element: E): void;
}

/**
 *
 */
export interface Template {
  raw: readonly string[] | ArrayLike<string>;
}

const defaultClassNamePrefix = "S";

let classNamePrefix = defaultClassNamePrefix;

/**
 *
 * @param prefix
 */
export function setClassNamePrefix(prefix: string) {
  classNamePrefix = prefix;
}

let styleSheet: CSSStyleSheet;

/**
 *
 * @param sheet
 */
export function setStyleSheet(sheet: CSSStyleSheet) {
  styleSheet = sheet;
}

/**
 *
 * @returns
 */
export function createStyleSheet() {
  const style = document.createElement("style");

  document.head.append(style);

  return style.sheet!;
}

let classNameCounter = 0;

/**
 *
 * @param style
 * @param substitutions
 * @returns
 */
export function css<E extends Element = HTMLElement>(
  style: Template,
  ...substitutions: unknown[]
): Hook<E> {
  const className =
    (classNamePrefix || defaultClassNamePrefix) + classNameCounter++;

  (styleSheet || (styleSheet = createStyleSheet())).insertRule(
    `.${className}{${String.raw(style, ...substitutions)}}`,
    styleSheet.cssRules.length,
  );

  return (element) => {
    element.classList.add(className);
  };
}

const defaultReferencePrefix = "E";

let referencePrefix = defaultReferencePrefix;

/**
 *
 * @param prefix
 */
export function setReferencePrefix(prefix: string) {
  referencePrefix = prefix;
}

const templates = new Map<Template, DocumentFragment>();

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
  const hooks = substitutions.map((item) =>
    typeof item === "function"
      ? {
          attach(element: Element, attribute: string) {
            element.removeAttribute(attribute);
            item(element);
          },
          query(fragment: DocumentFragment, attribute: string) {
            return fragment.querySelector(`[${attribute}]`);
          },
          render(attribute: string) {
            return ` ${attribute} `;
          },
          ...item,
        }
      : {
          attach(element: Element) {
            element.replaceWith(...nodes(item));
          },
          query(fragment: DocumentFragment, id: string) {
            return fragment.getElementById(id);
          },
          render(id: string) {
            return `<br id="${id}" />`;
          },
        },
  );

  if (!templates.has(template)) {
    let i = 0;

    templates.set(
      template,
      document.createRange().createContextualFragment(
        String.raw(
          template,
          ...hooks.map((hook) => {
            return hook.render(
              (referencePrefix || defaultReferencePrefix) + i++,
            );
          }),
        ),
      ),
    );
  }

  const fragment = templates.get(template)!.cloneNode(true) as DocumentFragment;

  let i = 0;

  for (const hook of hooks) {
    const reference = (referencePrefix || defaultReferencePrefix) + i++;

    hook.attach(hook.query(fragment, reference)!, reference);
  }

  return fragment;
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
 * @param hooks
 * @returns
 */
export function ref<E extends Element = HTMLElement>(...hooks: Hook<E>[]) {
  const item = Object.assign(
    (element: E) => {
      item.ref = element;

      for (const hook of hooks) {
        hook(item.ref);
      }
    },
    <{ ref: E; hook(...hooks: Hook<E>[]): E }>{
      ref: <E>{},
      attach(element: E) {
        element.removeAttribute("id");
        item(element);
      },
      hook(...hooks) {
        for (const hook of hooks) {
          hook(item.ref);
        }

        return item.ref;
      },
      query(fragment: DocumentFragment, id: string) {
        return fragment.getElementById(id);
      },
      render(id: string) {
        return ` id="${id}" `;
      },
    },
  );

  return item;
}

/**
 *
 * @param attributes
 * @returns
 */
export function set<E extends Element = HTMLElement>(
  attributes: object,
): Hook<E> {
  return (element) => {
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value == null ? "" : String(value));
    }
  };
}
