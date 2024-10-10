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
export interface Hook<N extends ParentNode> {
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
export type Option<N extends ParentNode> =
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
export type Properties<N> = {
  [P in keyof N]?: N[P] | Property<N[P]>;
};

/**
 *
 */
export type Property<V> = [
  Callback<V, V | typeof nil>,
  ...Observable<unknown>[],
];

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
 */
export const nil = Symbol();
