import type { Stringer } from "./core.ts";
import { getDocument } from "./document.ts";
import { type Hook, hook } from "./hook.ts";

/**
 *
 */
export type Definition =
  | Partial<CSSStyleDeclaration>
  | [string, ...Definition[]];

function apply(rule: CSSStyleRule, definition: Definition): unknown {
  if (!Array.isArray(definition)) {
    return Object.assign(rule.style, definition);
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
  return document.head.appendChild(element), element.sheet!;
}

const style: {
  counter: bigint;
  sheet?: CSSStyleSheet;
  prefix?: string;
} = {
  counter: 0n,
};

/**
 *
 * @param definitions
 * @returns
 */
export function css<E extends Element>(
  ...definitions: Definition[]
): Hook<E> & Stringer {
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
    hook<E>((element) => element.classList.add(className)),
    {
      toString() {
        return className;
      },
    },
  );
}

/**
 * @param prefix
 */
export function setStylePrefix(prefix: string): void {
  style.prefix = prefix;
}

/**
 * @param sheet
 */
export function setStyleSheet(sheet: CSSStyleSheet): void {
  style.sheet = sheet;
}
