/**
 *
 */
export interface Function<V = void, R = void> {
  (value: V): R;
}

/**
 *
 */
export interface Stringer {
  toString(): string;
}

const dependencies = new WeakMap();

/**
 *
 * @param dependency
 * @param dependant
 */
export function bind(dependency: object, dependant: unknown): void {
  const bond = Symbol();
  dependencies.set(bond, dependant);
  Object.assign(dependency, { [bond]: undefined });
}
