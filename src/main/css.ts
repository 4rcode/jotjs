import { getDocument } from "./document.ts";
import { Function } from "./types.ts";

const style: {
  counter: number;
  sheet?: CSSStyleSheet;
  prefix?: string;
} = {
  counter: 0,
};

/**
 *
 * @param rules
 * @returns
 */
export function css(rules: {
  [selector: string]: Partial<CSSStyleDeclaration>;
}): Function<Element, void> {
  if (!style.sheet) {
    const document = getDocument();
    const element = document.createElement("style");

    document.head.appendChild(element);

    style.sheet = element.sheet!;
  }

  const className = (style.prefix || "s") + style.counter++;

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

  return Object.assign(
    (element: Element) => {
      element.classList.add(className);
    },
    {
      toString() {
        return className;
      },
    },
  );
}

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
