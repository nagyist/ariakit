import { combineProps } from "@solid-primitives/props";
import { type MaybeAccessor, access } from "@solid-primitives/utils";
import {
  type Accessor,
  type Setter,
  type ValidComponent,
  createSignal,
  createUniqueId,
} from "solid-js";
import type { WrapInstance, WrapInstanceValue } from "./types.ts";

/**
 * Generates a unique ID.
 */
export function createId(
  defaultId?: MaybeAccessor<string | undefined>,
): Accessor<string> {
  const id = createUniqueId();
  return () => access(defaultId) ?? id;
}

/**
 * Returns the tag name by parsing an element.
 * @example
 * function Component(props) {
 *   const [ref, setRef] = createSignal();
 *   const tagName = extractTagName(ref, "button"); // () => "div"
 *   return <div ref={setRef} {...props} />;
 * }
 */
export function extractTagName(
  refOrElement?: MaybeAccessor<HTMLElement | undefined>,
  fallback?: ValidComponent,
) {
  return () => {
    const element = access(refOrElement);
    return (
      element?.tagName.toLowerCase() ??
      (typeof fallback === "string" ? fallback : undefined)
    );
  };
}

/**
 * Returns props with an additional `wrapInstance` prop.
 */
export function wrapInstance<P, Q = P & { wrapInstance: WrapInstance }>(
  props: P & { wrapInstance?: WrapInstance },
  element: WrapInstanceValue,
): Q {
  const wrapInstance = [...(props.wrapInstance ?? []), element];
  return combineProps(props, { wrapInstance }) as Q;
}

/**
 * A ref object that contains the value getter (`value`) and setter (`set`) as
 * properties for convenience. It also has a `reset` method that can be used to
 * set the value to the initial value that was passed, which is `undefined` by
 * default.
 *
 * Created by the `createRef` function.
 * @example
 * const ref = createRef();
 * createEffect(() => {
 *   console.log(ref.value);
 * });
 * ref.set(buttonElement);
 * ref.reset();
 */
export type RefStore<T> = {
  /**
   * The current value of the ref. It is a reactive getter.
   */
  value: T;
  /**
   * The setter function for the ref.
   */
  set: Setter<T>;
  /**
   * Resets the ref to the initial value that was passed, which is `undefined`
   * by default.
   */
  reset: () => void;
};

/**
 * Creates a ref object that contains the value getter (`value`) and setter
 * (`set`) as properties for convenience. It also has a `reset` method that
 * can be used to set the value to the initial value that was passed,
 * which is `undefined` by default.
 * @example
 * ```jsx
 * const ref = createRef();
 * createEffect(() => {
 *   console.log(ref.value);
 * });
 * <button ref={ref.set}>Button</button>
 * ```
 */
export function createRef<T>(): RefStore<T | undefined>;
export function createRef<T>(initialValue: T): RefStore<T>;
export function createRef<T>(initialValue?: any): any {
  const [value, set] = createSignal<T>(initialValue);
  return {
    get value() {
      return value();
    },
    set,
    reset: () => set(initialValue),
  };
}
