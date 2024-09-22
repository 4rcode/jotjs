/**
 *
 */
export interface Disposable {
  (): void;
}

/**
 *
 */
export interface Observable<V> {
  (observer: Observer<V>): Disposable;
  value: V;
}

/**
 *
 */
export interface Observer<V> {
  (value: V): void;
}

let win: Window = window;

export function setWindow(window: Window): void {
  win = window;
}

export function use<V>(value: V, ...observers: Observer<V>[]): Observable<V> {
  const subscribers = new Set<Observer<V>>(observers);

  return Object.assign(
    Object.defineProperty(
      (...observers: Observer<V>[]) => {
        for (const observer of observers) {
          subscribers.add(observer);
        }

        return () => {
          for (const observer of observers) {
            subscribers.delete(observer);
          }
        };
      },
      "value",
      {
        get() {
          return value;
        },

        set(next: V) {
          if (value === next) {
            return;
          }

          value = next;

          for (const publish of subscribers) {
            publish(value);
          }
        },
      },
    ),
    { value },
  );
}

export function spy<V>(
  observer: () => V,
  ..._observables: Observable<unknown>[]
): Observable<V> {
  return use(observer());
}

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
          const element = win.document.createElement(property);

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
  const fragment = win.document.createDocumentFragment();

  fragment.append(...nodes);

  return fragment;
}

export function state<S>(state: S, view?: (state: S) => Node) {
  const disposables = new Set<Disposable>();
  const observers = new Set<Observer<S>>();

  const addObserver = (observer: Observer<S>) => {
    observers.add(observer);

    return () => {
      observers.delete(observer);
    };
  };

  return Object.assign(
    Object.defineProperties(
      (element: HTMLElement) => {
        if (!view) {
          const slot = text(state);

          disposables.add(
            addObserver((state) => {
              slot.textContent = state == null ? "" : String(state);
            }),
          );

          return element.append(slot);
        }

        const start = text();
        const end = text();
        const range = win.document.createRange();
        const frag = fragment(start, view(state), end);

        element.append(frag);

        range.setStartAfter(start);
        range.setEndBefore(end);

        disposables.add(
          addObserver((state) => {
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

            for (const observe of observers) {
              observe(state);
            }
          },
        },
      },
    ),
    {
      addObserver,
      dispose() {
        for (const dispose of disposables) {
          dispose();
          disposables.delete(dispose);
        }
      },
      value: state,
    },
  );
}

export function text(value?: unknown) {
  return win.document.createTextNode(value == null ? "" : String(value));
}

export function view(
  _view: () => unknown,
  ...observables: Observable<unknown>[]
) {
  const disposables = new Set<Disposable>();
  const observers = new Set<Observer<void>>();

  const addObserver = (observer: Observer<void>) => {
    observers.add(observer);

    return () => {
      observers.delete(observer);
    };
  };

  return Object.assign(
    (_element: HTMLElement) => {
      const _observer = () => {
        console.log("changed");
      };

      for (const _observable of observables) {
        // observable.addObserver(observer);
      }
    },
    {
      addObserver,
      dispose() {
        for (const dispose of disposables) {
          dispose();
          disposables.delete(dispose);
        }
      },
    },
  );
}
