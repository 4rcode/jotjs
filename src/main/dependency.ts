const dependencies = new WeakMap();

/**
 *
 * @param context
 * @param dependency
 */
export function register(context: object, dependency: unknown) {
  dependencies.set(context, dependency);
}
