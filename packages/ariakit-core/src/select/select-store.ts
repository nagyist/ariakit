import type { ComboboxStore } from "../combobox/combobox-store.js";
import type {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { createCompositeStore } from "../composite/composite-store.js";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import { createPopoverStore } from "../popover/popover-store.js";
import { toArray } from "../utils/array.js";
import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import {
  batch,
  createStore,
  mergeStore,
  omit,
  setup,
  sync,
  throwOnConflictingProps,
} from "../utils/store.js";
import type { PickRequired, SetState } from "../utils/types.js";

type MutableValue<T extends SelectStoreValue = SelectStoreValue> =
  T extends string ? string : T;

export function createSelectStore<
  T extends SelectStoreValue = SelectStoreValue,
>(
  props: PickRequired<SelectStoreProps<T>, "value" | "defaultValue">,
): SelectStore<T>;

export function createSelectStore(props?: SelectStoreProps): SelectStore;

export function createSelectStore({
  combobox,
  ...props
}: SelectStoreProps = {}): SelectStore {
  const store = mergeStore(
    props.store,
    omit(combobox, [
      "value",
      "items",
      "renderedItems",
      "baseElement",
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement",
    ]),
  );

  throwOnConflictingProps(props, store);

  const syncState = store.getState();

  const composite = createCompositeStore({
    ...props,
    store,
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState.virtualFocus,
      true,
    ),
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState.includesBaseElement,
      false,
    ),
    activeId: defaultValue(
      props.activeId,
      syncState.activeId,
      props.defaultActiveId,
      null,
    ),
    orientation: defaultValue(
      props.orientation,
      syncState.orientation,
      "vertical" as const,
    ),
  });

  const popover = createPopoverStore({
    ...props,
    store,
    placement: defaultValue(
      props.placement,
      syncState.placement,
      "bottom-start" as const,
    ),
  });

  const initialValue = new String("") as "";

  const initialState: SelectStoreState = {
    ...composite.getState(),
    ...popover.getState(),
    value: defaultValue(
      props.value,
      syncState.value,
      props.defaultValue,
      initialValue,
    ),
    setValueOnMove: defaultValue(
      props.setValueOnMove,
      syncState.setValueOnMove,
      false,
    ),
    selectElement: defaultValue(syncState.selectElement, null),
    labelElement: defaultValue(syncState.labelElement, null),
  };

  const select = createStore(initialState, composite, popover, store);

  // Automatically sets the default value if it's not set.
  setup(select, () =>
    sync(select, ["value", "items"], (state) => {
      if (state.value !== initialValue) return;
      if (!state.items.length) return;
      const item = state.items.find(
        (item) => !item.disabled && item.value != null,
      );
      if (item?.value == null) return;
      select.setState("value", item.value);
    }),
  );

  // Sets the active id when the value changes and the popover is hidden.
  setup(select, () =>
    sync(select, ["mounted", "items", "value"], (state) => {
      // TODO: Revisit this. See test "open with keyboard, then try to open
      // again"
      if (combobox) return;
      if (state.mounted) return;
      const values = toArray(state.value);
      const lastValue = values[values.length - 1];
      if (lastValue == null) return;
      const item = state.items.find(
        (item) => !item.disabled && item.value === lastValue,
      );
      if (!item) return;
      // TODO: This may be problematic.
      select.setState("activeId", item.id);
    }),
  );

  // Sets the select value when the active item changes by moving (which usually
  // happens when moving to an item using the keyboard).
  setup(select, () =>
    batch(select, ["setValueOnMove", "focusedId"], (state) => {
      const { mounted, value } = select.getState();
      if (!state.setValueOnMove && mounted) return;
      if (Array.isArray(value)) return;
      if (!state.focusedId) return;
      const item = composite.item(state.focusedId);
      if (!item || item.disabled || item.value == null) return;
      select.setState("value", item.value);
    }),
  );

  return {
    ...composite,
    ...popover,
    ...select,
    combobox,
    setValue: (value) => select.setState("value", value),
    setSelectElement: (element) => select.setState("selectElement", element),
    setLabelElement: (element) => select.setState("labelElement", element),
  };
}

export type SelectStoreValue = string | string[];

export interface SelectStoreItem extends CompositeStoreItem {
  value?: string;
}

export interface SelectStoreState<T extends SelectStoreValue = SelectStoreValue>
  extends CompositeStoreState<SelectStoreItem>,
    PopoverStoreState {
  /** @default true */
  virtualFocus: CompositeStoreState<SelectStoreItem>["virtualFocus"];
  /** @default null */
  activeId: CompositeStoreState<SelectStoreItem>["activeId"];
  /** @default "vertical" */
  orientation: CompositeStoreState<SelectStoreItem>["orientation"];
  /** @default "bottom-start" */
  placement: PopoverStoreState["placement"];
  /**
   * The select value.
   *
   * Live examples:
   * - [Form with Select](https://ariakit.org/examples/form-select)
   * - [Select Grid](https://ariakit.org/examples/select-grid)
   * - [Select with custom
   *   items](https://ariakit.org/examples/select-item-custom)
   * - [Multi-Select](https://ariakit.org/examples/select-multiple)
   * - [Toolbar with Select](https://ariakit.org/examples/toolbar-select)
   * - [Select with Next.js App
   *   Router](https://ariakit.org/examples/select-next-router)
   */
  value: MutableValue<T>;
  /**
   * Whether the select
   * [`value`](https://ariakit.org/reference/select-provider#value) should be
   * set when the active item changes by moving (which usually happens when
   * moving to an item using the keyboard).
   *
   * Live examples:
   * - [Select Grid](https://ariakit.org/examples/select-grid)
   * - [Select with custom
   *   items](https://ariakit.org/examples/select-item-custom)
   * @default false
   */
  setValueOnMove: boolean;
  /**
   * The select button element.
   *
   * Live examples:
   * - [Form with Select](https://ariakit.org/examples/form-select)
   */
  selectElement: HTMLElement | null;
  /**
   * The select label element.
   */
  labelElement: HTMLElement | null;
}

export interface SelectStoreFunctions<
  T extends SelectStoreValue = SelectStoreValue,
> extends Pick<SelectStoreOptions<T>, "combobox">,
    CompositeStoreFunctions<SelectStoreItem>,
    PopoverStoreFunctions {
  /**
   * Sets the [`value`](https://ariakit.org/reference/select-provider#value)
   * state.
   * @example
   * store.setValue("Apple");
   * store.setValue(["Apple", "Banana"]);
   * store.setValue((value) => value === "Apple" ? "Banana" : "Apple"));
   */
  setValue: SetState<SelectStoreState<T>["value"]>;
  /**
   * Sets the `selectElement` state.
   */
  setSelectElement: SetState<SelectStoreState<T>["selectElement"]>;
  /**
   * Sets the `labelElement` state.
   */
  setLabelElement: SetState<SelectStoreState<T>["labelElement"]>;
}

export interface SelectStoreOptions<
  T extends SelectStoreValue = SelectStoreValue,
> extends StoreOptions<
      SelectStoreState<T>,
      | "virtualFocus"
      | "activeId"
      | "orientation"
      | "placement"
      | "value"
      | "setValueOnMove"
    >,
    CompositeStoreOptions<SelectStoreItem>,
    PopoverStoreOptions {
  /**
   * A reference to a combobox store. This is used when combining the combobox
   * with a select (e.g., select with a search input). The stores will share the
   * same state.
   */
  combobox?: ComboboxStore | null;
  /**
   * The default value. If not set, the first non-disabled item will be used.
   *
   * Live examples:
   * - [Form with Select](https://ariakit.org/examples/form-select)
   * - [Animated Select](https://ariakit.org/examples/select-animated)
   * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
   * - [SelectGroup](https://ariakit.org/examples/select-group)
   * - [Select with Next.js App
   *   Router](https://ariakit.org/examples/select-next-router)
   */
  defaultValue?: SelectStoreState<T>["value"];
}

export interface SelectStoreProps<T extends SelectStoreValue = SelectStoreValue>
  extends SelectStoreOptions<T>,
    StoreProps<SelectStoreState<T>> {}

export interface SelectStore<T extends SelectStoreValue = SelectStoreValue>
  extends SelectStoreFunctions<T>,
    Store<SelectStoreState<T>> {}
