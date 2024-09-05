declare module "core" {
    interface Hook {
        attach(node: Node): void;
        render?(reference: string): string;
    }
    interface Template {
        raw: readonly string[] | ArrayLike<string>;
    }
    export function add(...nodes: (string | Node)[]): ((...nodes: (string | Node)[]) => void) & {
        attach(node: Node): void;
    };
    /**
     *
     * @param values
     * @returns
     */
    export function attrs(values?: object): ((values: object) => void) & {
        attach(node: Node): void;
    };
    /**
     *
     * @param names
     * @returns
     */
    export function className(...names: string[]): ((...names: string[]) => void) & ((...hooks: Hook[]) => Node) & {
        attach(node: Node): void;
    };
    /**
     *
     * @param node
     * @returns
     */
    export function element<E extends Element>(node: Node): E;
    /**
     *
     * @param nodes
     * @returns
     */
    export function fragment(...nodes: (string | Node)[]): DocumentFragment;
    /**
     *
     * @param hooks
     * @returns
     */
    export function func(...hooks: ((node: Node) => void)[]): ((...hooks: ((node: Node) => void)[]) => void) & ((...hooks: Hook[]) => Node) & {
        attach(node: Node): void;
    };
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
    export function on<E extends HTMLElement, T extends keyof HTMLElementEventMap>(type: T, listener: (this: E, event: HTMLElementEventMap[T]) => void, options?: boolean | AddEventListenerOptions): Hook;
    /**
     *
     * @param type
     * @param listener
     * @param options
     * @returns
     */
    export function on(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): Hook;
    export function props<T extends keyof HTMLElementTagNameMap>(_tag: T, values?: Partial<HTMLElementTagNameMap[T]>): ((values: Partial<HTMLElementTagNameMap[T]>) => void) & ((...hooks: Hook[]) => Node) & {
        attach(node: Node): void;
    };
    export function put(...nodes: (string | Node)[]): ((...nodes: (string | Node)[]) => void) & ((...hooks: Hook[]) => Node) & {
        attach(node: Node): void;
    };
    /**
     *
     * @param hooks
     * @returns
     */
    export function ref<N extends Node>(...hooks: Hook[]): ((...hooks: Hook[]) => N) & {
        attach(node: Node): void;
    };
    /**
     *
     * @param nodes
     * @returns
     */
    export function slot(...nodes: (string | Node)[]): Hook;
    /**
     *
     * @param value
     * @returns
     */
    export function text(value?: unknown): ((value: unknown) => void) & Hook;
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
