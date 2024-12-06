import { getDocument } from "./document.ts";
import { Hook, Stringer } from "./tags.ts";

/**
 *
 */
export type Definition =
  | Partial<CSSStyleDeclaration>
  | [string, ...Definition[]];

function apply(rule: CSSStyleRule, definition: Definition): void {
  if (!Array.isArray(definition)) {
    return Object.assign(rule.style, definition), undefined;
  }

  const [selector, ...definitions] = definition;

  const nested = rule.cssRules[
    rule.insertRule(`${selector}{}`, rule.cssRules.length)
  ] as CSSStyleRule;

  for (const definition of definitions) {
    apply(nested, definition);
  }
}

function createStyleSheet(): CSSStyleSheet {
  const document = getDocument();
  const element = document.createElement("style");

  document.head.appendChild(element);

  return element.sheet!;
}

const style: {
  counter: number;
  sheet?: CSSStyleSheet;
  prefix?: string;
} = {
  counter: 0,
};

/**
 *
 * @param definitions
 * @returns
 */
export function css(...definitions: Definition[]): Hook<Element> & Stringer {
  if (!style.sheet) {
    style.sheet = createStyleSheet();
  }

  const className = (style.prefix || "s") + style.counter++;

  const rule = style.sheet.cssRules[
    style.sheet.insertRule(`.${className}{}`, style.sheet.cssRules.length)
  ] as CSSStyleRule;

  for (const definition of definitions) {
    apply(rule, definition);
  }

  return Object.assign(
    <Hook<Element>>[
      (element) => {
        element.classList.add(className);
      },
    ],
    {
      toString() {
        return className;
      },
    },
  );
}

/**
 *
 * @param prefix
 */
export function setStylePrefix(prefix: string): void {
  style.prefix = prefix;
}

/**
 *
 * @param element
 */
export function setStyleSheet(sheet: CSSStyleSheet): void {
  style.sheet = sheet;
}
