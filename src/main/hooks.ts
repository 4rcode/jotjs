import { getDocument } from "./document.ts";
import { $ } from "./jot.ts";
import {
  Callback,
  Disposable,
  Hook,
  Mutable,
  Observable,
  Observer,
  Option,
} from "./types.ts";

/**
 *
 * @param spy
 * @param dependencies
 * @returns
 */
export function spy<V>(
  spy: Callback<V | undefined, V>,
  dependencies: Observable<unknown>[],
  view?: (value: V) => Option<ParentNode>,
): Mutable<V> & Observable<V> & Hook<ParentNode> & Disposable {
  const observable = use(spy(undefined), view);

  const observer = () => {
    observable.value = spy(observable.value);
  };

  const disposables = dependencies.map((dependency) =>
    dependency.add(observer),
  );

  return Object.assign(observable, {
    dispose() {
      for (const disposable of disposables) {
        disposable.dispose();
      }

      observable.dispose();
    },
  });
}

/**
 *
 * @param value
 * @param view
 * @returns
 */
export function use<V>(
  value: V,
  view?: (value: V) => Option<ParentNode>,
): Mutable<V> & Observable<V> & Hook<ParentNode> & Disposable {
  if (view == null) {
    view = (value) => value as Option<ParentNode>;
  }

  const observers = new Set<Observer<V>>();

  return {
    add(observer: Observer<V>) {
      observers.add(observer);

      return {
        dispose() {
          observers.delete(observer);
        },
      };
    },
    dispose() {
      observers.clear();
    },
    hook(node: ParentNode) {
      const document = getDocument();
      const start = document.createTextNode("");
      const end = document.createTextNode("");

      node.append(start, $(view(value)), end);

      observers.add((state) => {
        const range = document.createRange();

        range.setStartAfter(start);
        range.setEndBefore(end);
        range.deleteContents();
        range.insertNode($(view(state)));
      });
    },
    get value() {
      return value;
    },

    set value(next: V) {
      if (value === next) {
        return;
      }

      value = next;

      for (const observe of observers) {
        observe(value);
      }
    },
  };
}
