---
tags:
  - Plus
  - Combobox
  - Concurrent React
  - Search
  - Dropdowns
  - Form controls
  - Advanced
  - Abstracted examples
---

# Combobox with integrated filter

<div data-description>

Filtering options in a [Combobox](/components/combobox) component through an abstracted implementation using `React.useDeferredValue`, resulting in a simple higher-level API.

</div>

<div data-tags></div>

<a href="./index.react.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/combobox)

</div>

## Dynamically rendering `ComboboxItem`

In this example, we've created an abstraction of the [`ComboboxItem`](/reference/combobox-item) component that dynamically renders based on the search value. This approach means users don't have to fret over filtering results or supplying an array of items to the component. They simply render all the items as `ComboboxItem`, and the component handles everything else:

```jsx {6}
function ComboboxItem(props) {
  const context = useContext(ComboboxContext);
  // ...
  const isMatch = context.matches.includes(props.value);
  // ...
  return isMatch ? <Ariakit.ComboboxItem {...props} /> : null;
}
```

However, the filtering logic can't change the order of the items. That is, the filtered items will always appear in the same order as the original list. This could be either desirable or not, depending on your needs. It's a good approach if you want to maintain the original order after filtering.

## Exposing `value` and `onChange` props

In this `Combobox` implementation, we're exposing custom `value` and `onChange` props so that the component can be used as a controlled input. This is done by passing the [`value`](/reference/use-combobox-store#value) and [`setValue`](/reference/use-combobox-store#setvalue) props to the lower-level [`useComboboxStore`](/reference/use-combobox-store) hook:

```js "value"1 "setValue:"
function Combobox({ value, onChange }) {
  const combobox = useComboboxStore({ value, setValue: onChange });
}
```

We can use the custom [`useStoreState`](/reference/use-store-state) hook provided by Ariakit to access the current value, regardless if it's controlled or uncontrolled:

```js
const searchValue = useStoreState(combobox, "value");
```

You can learn more about these functions on the [Component stores](/guide/component-stores) guide.

## Matching items using `React.useDeferredValue`

Then we pass the `searchValue` to the [`React.useDeferredValue`](https://react.dev/reference/react/useDeferredValue) hook, which will avoid blocking the main thread while the user is typing. In combination with the [match-sorter](https://www.npmjs.com/package/match-sorter) library, we can return a list of matches:

```js "useDeferredValue" "matchSorter"
const deferredValue = React.useDeferredValue(searchValue);

const matches = React.useMemo(() => {
  return matchSorter(list, deferredValue);
}, [list, deferredValue]);
```

## Related examples

<div data-cards="examples">

- [](/examples/combobox-filtering)
- [](/examples/combobox-animated)
- [](/examples/combobox-cancel)
- [](/examples/combobox-links)
- [](/examples/combobox-multiple)
- [](/examples/combobox-tabs)
- [](/examples/dialog-combobox-tab-command-menu)
- [](/examples/menu-nested-combobox)

</div>
```
