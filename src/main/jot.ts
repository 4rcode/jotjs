/**
 *
 */
export type Attributes = object[];

/**
 *
 */
export interface Callback<V, R = void> {
  (value: V): R;
}

/**
 *
 */
export interface Disposable {
  dispose(): void;
}

/**
 *
 */
export interface Hook<N> {
  hook(node: N): void;
}

/**
 *
 */
export interface Mutable<V> {
  value: V;
}

/**
 *
 */
export interface Observable<V> {
  add(observer: Observer<V>): Disposable;
}

/**
 *
 */
export interface Observer<V> {
  (value: V): void;
}

/**
 *
 */
export type Option<N> =
  | Attributes
  | bigint
  | boolean
  | Callback<N>
  | Hook<N>
  | Node
  | null
  | number
  | Properties<N>
  | string
  | symbol
  | undefined
  | View
  | void;

/**
 *
 */
export type Property<V> = [
  Callback<V, V | undefined | void>,
  ...Observable<unknown>[],
];

/**
 *
 */
export type Properties<N> = {
  [P in keyof N]?: N[P] | Property<N[P]>;
};

/**
 *
 */
export type Tags = {
  [T in keyof HTMLElementTagNameMap]: (
    ...options: Option<HTMLElementTagNameMap[T]>[]
  ) => HTMLElementTagNameMap[T];
};

/**
 *
 */
export type View = [
  Callback<void, Option<ParentNode>>,
  ...Observable<unknown>[],
];

/**
 *
 * @param options
 * @returns
 */
export function $(...options: Option<ParentNode>[]): ParentNode {
  return jot(doc.createDocumentFragment(), ...options);
}

/**
 *
 * @param rules
 * @returns
 */
export function css(rules: {
  [selector: string]: Partial<CSSStyleDeclaration>;
}): Hook<Element> {
  if (!style.sheet) {
    const element = doc.createElement("style");

    doc.head.appendChild(element);

    style.sheet = element.sheet!;
  }

  const className = style.prefix + style.counter++;

  const rule = style.sheet.cssRules[
    style.sheet.insertRule(`.${className}{}`, style.sheet.cssRules.length)
  ] as CSSStyleRule;

  for (const [selector, nested] of Object.entries(rules)) {
    Object.assign(
      (
        rule.cssRules[
          rule.insertRule(`${selector}{}`, rule.cssRules.length)
        ] as CSSStyleRule
      ).style,
      nested,
    );
  }

  return {
    hook(node) {
      node.classList.add(className);
    },
    ...{
      toString() {
        return className;
      },
    },
  };
}

function isElement(target: object): target is Element {
  return "setAttribute" in target;
}

function isHook<N>(target: object): target is Hook<N> {
  return "hook" in target;
}

function isNode(target: object): target is Node {
  return "append" in target;
}

function isProperty<V>(target: unknown): target is Property<V> {
  return Array.isArray(target) && typeof target[0] === "function";
}

function isView(target: unknown[]): target is View {
  return typeof target[0] === "function";
}

/**
 *
 * @param node
 * @param options
 * @returns
 */
export function jot<N extends ParentNode>(node: N, ...options: Option<N>[]): N {
  for (const option of options) {
    parse(option, node);
  }

  return node;
}

function parse<N extends ParentNode>(option: Option<N>, node: N): unknown {
  if (option == null) {
    return;
  }

  switch (typeof option) {
    case "string":
      return node.append(option);

    case "function":
      return option(node);

    case "object": {
      if (isHook<N>(option)) {
        return option.hook(node);
      }

      if (isNode(option)) {
        return node.append(option);
      }

      if (!Array.isArray(option)) {
        for (const key in option) {
          const value: unknown = option[key];

          if (isProperty(value)) {
            const [view, ...dependencies] = value;

            spy(() => {
              const value = view(node[key]);

              if (value !== undefined) {
                Object.assign(node, { [key]: value });
              }

              return value;
            }, dependencies);
          } else {
            Object.assign(node, { [key]: value });
          }
        }

        return;
      }

      if (isView(option)) {
        const [view, ...dependencies] = option;

        return spy(view, dependencies).hook(node);
      }

      if (!isElement(node)) {
        return;
      }

      for (const attributes of option) {
        for (const [name, value] of Object.entries(attributes)) {
          if (value == null) {
            node.removeAttribute(name);
          } else {
            node.setAttribute(name, String(value));
          }
        }
      }

      return;
    }
  }

  return node.append(String(option));
}

let doc: Document = document;

/**
 *
 * @param document
 */
export function setDocument(document: Document): void {
  doc = document;
}

const style: {
  counter: number;
  sheet?: CSSStyleSheet;
  prefix: string;
} = {
  counter: 0,
  prefix: "s",
};

/**
 *
 * @param element
 */
export function setStyleSheet(sheet: CSSStyleSheet) {
  style.sheet = sheet;
}

/**
 *
 * @param prefix
 */
export function setStylePrefix(prefix: string) {
  style.prefix = prefix || "s";
}

/**
 *
 * @param spy
 * @param dependencies
 * @returns
 */
export function spy<V>(
  spy: Callback<V | undefined, V>,
  dependencies: Observable<unknown>[],
  view?: (value: V) => Option<ParentNode>,
): Mutable<V> & Observable<V> & Hook<ParentNode> & Disposable {
  const observable = use(spy(undefined), view);

  const observer = () => {
    observable.value = spy(observable.value);
  };

  const disposables = dependencies.map((dependency) =>
    dependency.add(observer),
  );

  return Object.assign(observable, {
    dispose() {
      for (const disposable of disposables) {
        disposable.dispose();
      }

      observable.dispose();
    },
  });
}

/**
 *
 */
export const tags = new Proxy(<Tags>{}, {
  get(target, property, receiver) {
    if (typeof property !== "string") {
      return Reflect.get(target, property, receiver);
    }

    return (...options: Option<ParentNode>[]) => {
      return jot(doc.createElement(property), ...options);
    };
  },
});

/**
 *
 * @param value
 * @param view
 * @returns
 */
export function use<V>(
  value: V,
  view?: (value: V) => Option<ParentNode>,
): Mutable<V> & Observable<V> & Hook<ParentNode> & Disposable {
  if (view == null) {
    view = (value) => value as Option<ParentNode>;
  }

  const observers = new Set<Observer<V>>();

  return {
    add(observer: Observer<V>) {
      observers.add(observer);

      return {
        dispose() {
          observers.delete(observer);
        },
      };
    },
    dispose() {
      observers.clear();
    },
    hook(node: ParentNode) {
      const start = doc.createTextNode("");
      const end = doc.createTextNode("");

      node.append(start, $(view(value)), end);

      observers.add((state) => {
        const range = doc.createRange();

        range.setStartAfter(start);
        range.setEndBefore(end);
        range.deleteContents();
        range.insertNode($(view(state)));
      });
    },
    get value() {
      return value;
    },

    set value(next: V) {
      if (value === next) {
        return;
      }

      value = next;

      for (const observe of observers) {
        observe(value);
      }
    },
  };
}
