declare module "core" {
    /**
     *
     */
    export interface Hook<E extends Element = HTMLElement> {
        (element: E): void;
    }
    interface Template {
        raw: readonly string[] | ArrayLike<string>;
    }
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
    export function on<T extends keyof HTMLElementEventMap, E extends HTMLElement = HTMLElement>(type: T, listener: (this: E, event: HTMLElementEventMap[T]) => void, options?: boolean | AddEventListenerOptions): Hook<E>;
    /**
     *
     * @param type
     * @param listener
     * @param options
     * @returns
     */
    export function on<E extends Element = HTMLElement>(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): Hook<E>;
    /**
     *
     * @param attributes
     * @returns
     */
    export function put<E extends Element = HTMLElement>(attributes: object): Hook<E>;
    /**
     *
     * @param callbacks
     * @returns
     */
    export function ref<E extends Element = HTMLElement>(...callbacks: Hook<E>[]): [E, (...hooks: Hook<E>[]) => E];
    /**
     *
     * @param properties
     * @returns
     */
    export function set<E extends Element = HTMLElement>(properties: Partial<E>): Hook<E>;
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
