/**
 *
 */
export interface Disposable {
  dispose(): void;
}

/**
 *
 */
export interface Function<V, R = void> {
  (value: V): R;
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
export type Option<N extends ParentNode> =
  | bigint
  | boolean
  | Function<N, Option<N>>
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
export type Property<V> = Function<V, V | undefined | void>[];

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
export type View = Function<void, Option<ParentNode>>[];
