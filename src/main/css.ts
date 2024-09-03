interface Template {
  raw: readonly string[] | ArrayLike<string>;
}

interface JotRule extends Partial<CSSStyleDeclaration> {
  _children?: JotRule[];
  _selector?: string;
}

let counter = 0;
let styleNamePrefix: string;
let styleSheet: CSSStyleSheet;

/**
 *
 * @returns
 */
export function createStyleSheet() {
  const style = document.createElement("style");

  document.head.append(style);

  if (!style.sheet) {
    throw new Error("The CSSStyleSheet cannot be null");
  }

  return style.sheet;
}

/**
 *
 * @param style
 * @param substitutions
 * @returns
 */
export function css(style: Template | JotRule, ...substitutions: unknown[]) {
  if (!styleSheet) {
    styleSheet = createStyleSheet();
  }

  const name = (styleNamePrefix || "s") + counter++;

  if ("raw" in style) {
    const rule = String.raw(style, ...substitutions);

    styleSheet.insertRule(`.${name}{${rule}}`);
  } else {
    insertRule(styleSheet.cssRules[styleSheet.insertRule(`.${name}{}`)], style);
  }

  return name;
}

/**
 *
 * @param cssRule
 * @param jotRule
 */
export function insertRule(cssRule: CSSRule, jotRule: JotRule) {
  if (isCSSGroupingRule(cssRule)) {
    cssRule =
      cssRule.cssRules[cssRule.insertRule(`${jotRule._selector || "&"}{}`)];
  }

  if (cssRule instanceof CSSStyleRule) {
    Object.assign(cssRule.style, jotRule);
  }

  if (!jotRule._children) {
    return;
  }

  for (const child of jotRule._children) {
    insertRule(cssRule, child);
  }
}

function isCSSGroupingRule(rule: CSSRule): rule is CSSGroupingRule {
  return "cssRules" in rule;
}

/**
 *
 * @param prefix
 */
export function setStyleNamePrefix(prefix: string) {
  styleNamePrefix = prefix;
}

/**
 *
 * @param sheet
 */
export function setStyleSheet(sheet: CSSStyleSheet) {
  styleSheet = sheet;
}
