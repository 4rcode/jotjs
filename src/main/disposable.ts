const ACTIONS = Symbol();

/**
 *
 */
export interface Disposable {
  [ACTIONS]: (() => void)[];
}

/**
 *
 * @param target
 * @param items
 * @returns
 */
export function disposable<T extends object>(
  target: T,
  ...items: ((() => void) | Disposable)[]
): T & Disposable {
  const actions = items.flatMap(toAction);

  if (isDisposable(target)) {
    target[ACTIONS].push(...actions);

    return target;
  }

  return Object.assign(target, { [ACTIONS]: actions });
}

/**
 *
 * @param disposables
 */
export function dispose(...disposables: Disposable[]) {
  for (const disposable of disposables) {
    for (const dispose of disposable[ACTIONS]) {
      dispose();
    }

    disposable[ACTIONS] = [];
  }
}

/**
 *
 * @param target
 * @returns
 */
export function isDisposable(target: object): target is Disposable {
  return ACTIONS in target;
}

function toAction(item: (() => void) | Disposable): (() => void)[] {
  if (isDisposable(item)) {
    return item[ACTIONS];
  }

  return [item];
}
