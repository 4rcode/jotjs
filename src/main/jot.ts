// /**
//  *
//  */
// export type E<H extends HTMLElement> = Partial<H>;

// interface Template {
//   raw: readonly string[] | ArrayLike<string>;
// }

// const defaultClassNamePrefix = "S";

// let classNamePrefix = defaultClassNamePrefix;

// /**
//  *
//  * @param prefix
//  */
// export function setClassNamePrefix(prefix: string) {
//   classNamePrefix = prefix;
// }

// let styleSheet: CSSStyleSheet;

// /**
//  *
//  * @param sheet
//  */
// export function setStyleSheet(sheet: CSSStyleSheet) {
//   styleSheet = sheet;
// }

// /**
//  *
//  * @returns
//  */
// export function createStyleSheet() {
//   const style = document.createElement("style");

//   document.head.append(style);

//   return style.sheet!;
// }

// let classNameCounter = 0;

// /**
//  *
//  * @param style
//  * @param substitutions
//  * @returns
//  */
// export function css(style: Template, ...substitutions: unknown[]) {
//   const className =
//     (classNamePrefix || defaultClassNamePrefix) + classNameCounter++;

//   (styleSheet || (styleSheet = createStyleSheet())).insertRule(
//     `.${className}{${String.raw(style, ...substitutions)}}`,
//     styleSheet.cssRules.length,
//   );

//   return (element: Element) => {
//     element!.classList.add(className);
//   };
// }

// const defaultReferencePrefix = "E";

// let referencePrefix = defaultReferencePrefix;

// /**
//  *
//  * @param prefix
//  */
// export function setReferencePrefix(prefix: string) {
//   referencePrefix = prefix;
// }

// const templates = new Map<Template, DocumentFragment>();

// export const append = Symbol();

// export type Boh = Partial<
//   {
//     [T in keyof HTMLElementTagNameMap]: Partial<
//       HTMLElementTagNameMap[T] & {
//         [append]?: Boh[];
//       }
//     >;
//   } & {
//     [append]: Boh[];
//   }
// >;

// export interface Hook {
//   (): void;
// }

// /**
//  *
//  * @param template
//  * @param substitutions
//  * @returns
//  */
// export function html(
//   template: Template,
//   ...substitutions: (string | Node | Boh | Hook)[]
// ): DocumentFragment {
//   const hooks = substitutions.map((item) =>
//     typeof item === "function"
//       ? {
//           attach(element: HTMLElement, attribute: string) {
//             element.removeAttribute(attribute);
//             item(element);
//           },
//           query(fragment: DocumentFragment, attribute: string) {
//             return fragment.querySelector(`[${attribute}]`) as HTMLElement;
//           },
//           render(attribute: string) {
//             return ` ${attribute} `;
//           },
//           ...item,
//         }
//       : {
//           attach(element: HTMLElement) {
//             element.replaceWith(...nodes(item));
//           },
//           query(fragment: DocumentFragment, id: string) {
//             return fragment.getElementById(id);
//           },
//           render(id: string) {
//             return `<br id="${id}" />`;
//           },
//         },
//   );

//   if (!templates.has(template)) {
//     let i = 0;

//     templates.set(
//       template,
//       document.createRange().createContextualFragment(
//         String.raw(
//           template,
//           ...hooks.map((hook) => {
//             return hook.render(
//               (referencePrefix || defaultReferencePrefix) + i++,
//             );
//           }),
//         ),
//       ),
//     );
//   }

//   const fragment = templates.get(template)!.cloneNode(true) as DocumentFragment;

//   let i = 0;

//   for (const hook of hooks) {
//     const reference = (referencePrefix || defaultReferencePrefix) + i++;

//     hook.attach(hook.query(fragment, reference)!, reference);
//   }

//   return fragment;
// }

// function nodes(node: unknown): (string | Node)[] {
//   if (typeof node === "string" || node instanceof Node) {
//     return [node];
//   }

//   if (node instanceof Array) {
//     return node.flatMap((node) => nodes(node));
//   }

//   return [String(node)];
// }

// /**
//  *
//  * @param type
//  * @param listener
//  * @param options
//  * @returns
//  */
// export function on<T extends keyof HTMLElementEventMap, E extends HTMLElement>(
//   type: T,
//   listener: (this: E, event: HTMLElementEventMap[T]) => void,
//   options?: boolean | AddEventListenerOptions,
// ): Hook;

// /**
//  *
//  * @param type
//  * @param listener
//  * @param options
//  * @returns
//  */
// export function on(
//   type: string,
//   listener: EventListenerOrEventListenerObject,
//   options?: boolean | AddEventListenerOptions,
// ): Hook;

// export function on(
//   type: string,
//   listener: EventListenerOrEventListenerObject,
//   options?: boolean | AddEventListenerOptions,
// ): Hook {
//   return (element) => {
//     element.addEventListener(type, listener, options);
//   };
// }

// /**
//  *
//  * @param hooks
//  * @returns
//  */
// export function ref<E extends HTMLElement>(...hooks: Hook[]) {
//   const item = Object.assign(
//     (element: E) => {
//       item.ref = element;

//       for (const hook of hooks) {
//         hook(item.ref);
//       }
//     },
//     <{ ref: E; hook(...hooks: Hook[]): E }>{
//       ref: <E>{},
//       attach(element: E) {
//         element.removeAttribute("id");
//         item(element);
//       },
//       hook(...hooks) {
//         for (const hook of hooks) {
//           hook(item.ref);
//         }

//         return item.ref;
//       },
//       query(fragment: DocumentFragment, id: string) {
//         return fragment.getElementById(id);
//       },
//       render(id: string) {
//         return ` id="${id}" `;
//       },
//     },
//   );

//   return item;
// }

// /**
//  *
//  * @param attributes
//  * @returns
//  */
// export function set(attributes: object) {
//   return (element: Element) => {
//     for (const [name, value] of Object.entries(attributes)) {
//       element.setAttribute(name, value == null ? "" : String(value));
//     }
//   };
// }

export const tags = new Proxy(
  <
    {
      [K in keyof HTMLElementTagNameMap]: (
        ...args: (
          | string
          | Node
          | object[]
          | Partial<HTMLElementTagNameMap[K]>
          | ((element: HTMLElementTagNameMap[K]) => void)
        )[]
      ) => HTMLElementTagNameMap[K];
    }
  >{},
  {
    get(target, property, receiver) {
      if (typeof property === "string") {
        return (...items: unknown[]) => {
          const element = document.createElement(property);

          for (const item of items) {
            switch (typeof item) {
              case "function":
                item(element);
                break;
              case "string":
                element.append(item);
                break;
              case "object":
                if (item instanceof Node) {
                  element.append(item);
                } else if (item instanceof Array) {
                  for (const attributes of item) {
                    for (const [name, value] of Object.entries(attributes)) {
                      element.setAttribute(
                        name,
                        value == null ? "" : String(value),
                      );
                    }
                  }
                } else {
                  Object.assign(element, item);
                }

                break;
            }
          }

          return element;
        };
      }

      return Reflect.get(target, property, receiver);
    },
  },
);

export function fragment(...nodes: (string | Node)[]) {
  const fragment = document.createDocumentFragment();

  fragment.append(...nodes);

  return fragment;
}

export function state<S>(state: S, view?: (state: S) => Node) {
  const spies = new Set<(state: S) => void>();

  const spy = (spy: (state: S) => void) => {
    spies.add(spy);

    return () => {
      spies.delete(spy);
    };
  };

  const disposables = new Set<() => void>();

  return Object.assign(
    Object.defineProperties(
      (element: HTMLElement) => {
        if (!view) {
          const slot = text(state);

          element.append(slot);

          disposables.add(
            spy((state) => {
              slot.textContent = String(state);
            }),
          );

          return;
        }

        const start = text();
        const end = text();
        const range = document.createRange();
        const frag = fragment(start, view(state), end);

        element.append(frag);

        range.setStartAfter(start);
        range.setEndBefore(end);

        disposables.add(
          spy((state) => {
            // const tmp = frag;
            // frag = fragment(view(state));
            range.deleteContents();
            range.insertNode(view(state));
          }),
        );
      },
      {
        value: {
          get() {
            return state;
          },
          set(value: S) {
            state = value;

            for (const spy of spies) {
              spy(state);
            }
          },
        },
      },
    ),
    {
      dispose() {
        for (const dispose of disposables) {
          dispose();
          disposables.delete(dispose);
        }
      },
      spy,
      value: state,
    },
  );
}

export function text(value?: unknown) {
  return document.createTextNode(value == null ? "" : String(value));
}
