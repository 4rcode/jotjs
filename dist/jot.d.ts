declare module "bare" {
    interface HTMLElementFactory<E extends HTMLElement = HTMLElement> {
        (...options: Option<E>[]): E;
    }
    type HTMLElementTagMap = HTMLElementTagNameMap & Record<string, HTMLElement>;
    type Option<N extends Node> = string | Node | Partial<N> | ((value: N) => void) | {
        jot(value: N): void;
    };
    /**
     *
     * @param element
     * @param options
     * @returns
     */
    export function clone<N extends ParentNode>(node: N, ...options: Option<N>[]): () => N;
    /**
     *
     * @param tag
     * @param options
     * @returns
     */
    export function jot<T extends keyof HTMLElementTagMap, E extends T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement>(tag: T, ...options: Option<E>[]): E;
    /**
     *
     * @param node
     * @param options
     * @returns
     */
    export function jot<N extends ParentNode>(node: N, ...options: Option<N>[]): N;
    /**
     *
     */
    export const tags: {
        [x: string]: HTMLElementFactory<HTMLElement>;
        a: HTMLElementFactory<HTMLAnchorElement>;
        abbr: HTMLElementFactory<HTMLElement>;
        address: HTMLElementFactory<HTMLElement>;
        area: HTMLElementFactory<HTMLAreaElement>;
        article: HTMLElementFactory<HTMLElement>;
        aside: HTMLElementFactory<HTMLElement>;
        audio: HTMLElementFactory<HTMLAudioElement>;
        b: HTMLElementFactory<HTMLElement>;
        base: HTMLElementFactory<HTMLBaseElement>;
        bdi: HTMLElementFactory<HTMLElement>;
        bdo: HTMLElementFactory<HTMLElement>;
        blockquote: HTMLElementFactory<HTMLQuoteElement>;
        body: HTMLElementFactory<HTMLBodyElement>;
        br: HTMLElementFactory<HTMLBRElement>;
        button: HTMLElementFactory<HTMLButtonElement>;
        canvas: HTMLElementFactory<HTMLCanvasElement>;
        caption: HTMLElementFactory<HTMLTableCaptionElement>;
        cite: HTMLElementFactory<HTMLElement>;
        code: HTMLElementFactory<HTMLElement>;
        col: HTMLElementFactory<HTMLTableColElement>;
        colgroup: HTMLElementFactory<HTMLTableColElement>;
        data: HTMLElementFactory<HTMLDataElement>;
        datalist: HTMLElementFactory<HTMLDataListElement>;
        dd: HTMLElementFactory<HTMLElement>;
        del: HTMLElementFactory<HTMLModElement>;
        details: HTMLElementFactory<HTMLDetailsElement>;
        dfn: HTMLElementFactory<HTMLElement>;
        dialog: HTMLElementFactory<HTMLDialogElement>;
        div: HTMLElementFactory<HTMLDivElement>;
        dl: HTMLElementFactory<HTMLDListElement>;
        dt: HTMLElementFactory<HTMLElement>;
        em: HTMLElementFactory<HTMLElement>;
        embed: HTMLElementFactory<HTMLEmbedElement>;
        fieldset: HTMLElementFactory<HTMLFieldSetElement>;
        figcaption: HTMLElementFactory<HTMLElement>;
        figure: HTMLElementFactory<HTMLElement>;
        footer: HTMLElementFactory<HTMLElement>;
        form: HTMLElementFactory<HTMLFormElement>;
        h1: HTMLElementFactory<HTMLHeadingElement>;
        h2: HTMLElementFactory<HTMLHeadingElement>;
        h3: HTMLElementFactory<HTMLHeadingElement>;
        h4: HTMLElementFactory<HTMLHeadingElement>;
        h5: HTMLElementFactory<HTMLHeadingElement>;
        h6: HTMLElementFactory<HTMLHeadingElement>;
        head: HTMLElementFactory<HTMLHeadElement>;
        header: HTMLElementFactory<HTMLElement>;
        hgroup: HTMLElementFactory<HTMLElement>;
        hr: HTMLElementFactory<HTMLHRElement>;
        html: HTMLElementFactory<HTMLHtmlElement>;
        i: HTMLElementFactory<HTMLElement>;
        iframe: HTMLElementFactory<HTMLIFrameElement>;
        img: HTMLElementFactory<HTMLImageElement>;
        input: HTMLElementFactory<HTMLInputElement>;
        ins: HTMLElementFactory<HTMLModElement>;
        kbd: HTMLElementFactory<HTMLElement>;
        label: HTMLElementFactory<HTMLLabelElement>;
        legend: HTMLElementFactory<HTMLLegendElement>;
        li: HTMLElementFactory<HTMLLIElement>;
        link: HTMLElementFactory<HTMLLinkElement>;
        main: HTMLElementFactory<HTMLElement>;
        map: HTMLElementFactory<HTMLMapElement>;
        mark: HTMLElementFactory<HTMLElement>;
        menu: HTMLElementFactory<HTMLMenuElement>;
        meta: HTMLElementFactory<HTMLMetaElement>;
        meter: HTMLElementFactory<HTMLMeterElement>;
        nav: HTMLElementFactory<HTMLElement>;
        noscript: HTMLElementFactory<HTMLElement>;
        object: HTMLElementFactory<HTMLObjectElement>;
        ol: HTMLElementFactory<HTMLOListElement>;
        optgroup: HTMLElementFactory<HTMLOptGroupElement>;
        option: HTMLElementFactory<HTMLOptionElement>;
        output: HTMLElementFactory<HTMLOutputElement>;
        p: HTMLElementFactory<HTMLParagraphElement>;
        picture: HTMLElementFactory<HTMLPictureElement>;
        pre: HTMLElementFactory<HTMLPreElement>;
        progress: HTMLElementFactory<HTMLProgressElement>;
        q: HTMLElementFactory<HTMLQuoteElement>;
        rp: HTMLElementFactory<HTMLElement>;
        rt: HTMLElementFactory<HTMLElement>;
        ruby: HTMLElementFactory<HTMLElement>;
        s: HTMLElementFactory<HTMLElement>;
        samp: HTMLElementFactory<HTMLElement>;
        script: HTMLElementFactory<HTMLScriptElement>;
        search: HTMLElementFactory<HTMLElement>;
        section: HTMLElementFactory<HTMLElement>;
        select: HTMLElementFactory<HTMLSelectElement>;
        slot: HTMLElementFactory<HTMLSlotElement>;
        small: HTMLElementFactory<HTMLElement>;
        source: HTMLElementFactory<HTMLSourceElement>;
        span: HTMLElementFactory<HTMLSpanElement>;
        strong: HTMLElementFactory<HTMLElement>;
        style: HTMLElementFactory<HTMLStyleElement>;
        sub: HTMLElementFactory<HTMLElement>;
        summary: HTMLElementFactory<HTMLElement>;
        sup: HTMLElementFactory<HTMLElement>;
        table: HTMLElementFactory<HTMLTableElement>;
        tbody: HTMLElementFactory<HTMLTableSectionElement>;
        td: HTMLElementFactory<HTMLTableCellElement>;
        template: HTMLElementFactory<HTMLTemplateElement>;
        textarea: HTMLElementFactory<HTMLTextAreaElement>;
        tfoot: HTMLElementFactory<HTMLTableSectionElement>;
        th: HTMLElementFactory<HTMLTableCellElement>;
        thead: HTMLElementFactory<HTMLTableSectionElement>;
        time: HTMLElementFactory<HTMLTimeElement>;
        title: HTMLElementFactory<HTMLTitleElement>;
        tr: HTMLElementFactory<HTMLTableRowElement>;
        track: HTMLElementFactory<HTMLTrackElement>;
        u: HTMLElementFactory<HTMLElement>;
        ul: HTMLElementFactory<HTMLUListElement>;
        var: HTMLElementFactory<HTMLElement>;
        video: HTMLElementFactory<HTMLVideoElement>;
        wbr: HTMLElementFactory<HTMLElement>;
    };
}
declare module "core" {
    interface Template {
        raw: readonly string[] | ArrayLike<string>;
    }
    interface Hook {
        attach(node: Node): void;
        render?(ref: string): string;
    }
    export function attrs(values?: object): ((values: object) => void) & ((...hooks: Hook[]) => Node) & {
        attach(node: Node): void;
    };
    export function props<T extends keyof HTMLElementTagNameMap>(_tag: T, values?: Partial<HTMLElementTagNameMap[T]>): ((values: Partial<HTMLElementTagNameMap[T]>) => void) & ((...hooks: Hook[]) => Node) & {
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
     * @param nodes
     * @returns
     */
    export function fragment(...nodes: (string | Node)[]): DocumentFragment;
    /**
     *
     * @param nodes
     * @returns
     */
    export function slot(...nodes: (string | Node)[]): Hook;
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
    /**
     *
     * @param text
     * @returns
     */
    export function text(value?: unknown): ((value: unknown) => void) & Hook;
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
     * @param hooks
     * @returns
     */
    export function ref(...hooks: Hook[]): ((...hooks: Hook[]) => Node) & {
        attach(node: Node): void;
    };
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
    export * from "bare";
    export * from "core";
    export * from "css";
}
