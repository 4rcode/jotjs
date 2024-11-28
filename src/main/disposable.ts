/**
 *
 */
export interface Disposable {
  [dispose](): void;
}

/**
 *
 */
export const dispose = Symbol();

/**
 *
 * @param target
 * @returns
 */
export function isDisposable(target: object): target is Disposable {
  return dispose in target;
}
