declare module "core" {
    /**
     *
     */
    export interface Hook {
        jot: {
            attach(element: Element): void;
            render?(reference: string): string;
        };
    }
    /**
     *
     */
    export interface Template {
        raw: readonly string[] | ArrayLike<string>;
    }
    /**
     *
     * @param attributes
     * @returns
     */
    export function attr(attributes?: object): ((attributes: object) => void) & Hook;
    /**
     *
     * @param names
     * @returns
     */
    export function className(strategy: "add" | "remove" | "toggle", ...names: string[]): ((...names: string[]) => void) & Hook;
    /**
     *
     * @param template
     * @param substitutions
     * @returns
     */
    export function html(template: Template, ...substitutions: unknown[]): DocumentFragment;
    /**
     *
     * @param type
     * @param listener
     * @param options
     * @returns
     */
    export function on<T extends keyof HTMLElementEventMap, E extends HTMLElement = HTMLElement>(type: T, listener: (this: E, event: HTMLElementEventMap[T]) => void, options?: boolean | AddEventListenerOptions): Hook;
    /**
     *
     * @param type
     * @param listener
     * @param options
     * @returns
     */
    export function on(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): Hook;
    /**
     *
     * @param hooks
     * @returns
     */
    export function ref<E extends Element = HTMLElement>(...hooks: Hook[]): E & Hook;
    /**
     *
     * @param properties
     * @returns
     */
    export function set<E extends Element = HTMLElement>(properties?: Partial<E>): ((properties: Partial<E>) => void) & Hook;
    /**
     *
     * @param nodes
     * @returns
     */
    export function slot(...nodes: unknown[]): Hook;
    /**
     *
     * @param node
     * @returns
     */
    export function toNode(node: unknown): string | Node;
    /**
     *
     * @param nodes
     * @returns
     */
    export function wrap(...nodes: unknown[]): DocumentFragment;
}
declare module "css" {
    interface Template {
        raw: readonly string[] | ArrayLike<string>;
    }
    interface JotRule extends Partial<CSSStyleDeclaration> {
        _children?: JotRule[];
        _selector?: string;
    }
    /**
     *
     * @returns
     */
    export function createStyleSheet(): CSSStyleSheet;
    /**
     *
     * @param style
     * @param substitutions
     * @returns
     */
    export function css(style: Template | JotRule, ...substitutions: unknown[]): string;
    /**
     *
     * @param cssRule
     * @param jotRule
     */
    export function insertRule(cssRule: CSSRule, jotRule: JotRule): void;
    /**
     *
     * @param prefix
     */
    export function setStyleNamePrefix(prefix: string): void;
    /**
     *
     * @param sheet
     */
    export function setStyleSheet(sheet: CSSStyleSheet): void;
}
declare module "jot" {
    export * from "core";
    export * from "css";
}
