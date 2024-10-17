import { disposable, Disposable, dispose } from "./disposable.ts";

const OBSERVABLE = Symbol();

/**
 *
 */
export interface Observable<V> {
  [OBSERVABLE]: true;
  value: V;
}

const current: {
  disposables: Disposable[];
  observers: (() => void)[];
} = { disposables: [], observers: [] };

/**
 *
 * @param target
 * @returns
 */
export function isObservable<V>(target: object): target is Observable<V> {
  return OBSERVABLE in target;
}

/**
 *
 * @param callback
 * @returns
 */
export function spy<V>(
  callback: () => V,
): Readonly<Observable<V>> & Disposable {
  const observer = () => {
    observable.value = callback();
  };

  const spy = disposable(
    <Readonly<Observable<V>>>{
      [OBSERVABLE]: true,
      get value() {
        return observable.value;
      },
      set value(_: V) {
        // ignore
      },
    },
    () => dispose(observable),
  );

  current.disposables.push(spy);
  current.observers.push(observer);

  const observable = use(callback());

  current.observers.pop();
  current.disposables.pop();

  return spy;
}

/**
 *
 * @param value
 * @returns
 */
export function use<V>(value: V): Observable<V> & Disposable {
  const observers = new Set<(value: V) => void>();

  return disposable(
    {
      [OBSERVABLE]: true,
      get value() {
        const observer = current.observers.at(-1);
        const disposables = current.disposables.at(-1);

        if (!observer || !disposables) {
          return value;
        }

        observers.add(observer);
        disposable(disposables, () => observers.delete(observer));

        return value;
      },
      set value(next: V) {
        if (value === next) {
          return;
        }

        value = next;

        for (const observe of observers.values()) {
          observe(value);
        }
      },
    },
    () => observers.clear(),
  );
}
