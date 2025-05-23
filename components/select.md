---
tags:
  - Select
  - Dropdowns
  - Form controls
---

# Select

<div data-description>

Select a value from a list of options presented in a dropdown menu, similar to the native HTML select element. This component is based on the [WAI-ARIA Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

</div>

<div data-tags></div>

<a href="../examples/select/index.react.tsx" data-playground>Example</a>

## Examples

<div data-cards="examples">

- [](/examples/select-animated)
- [](/examples/select-combobox)
- [](/examples/select-combobox-tab)
- [](/examples/select-next-router)

</div>

## API

```jsx
useSelectStore()
useSelectContext()

<SelectProvider>
  <SelectLabel />
  <Select>
    <SelectValue />
    <SelectArrow />
  </Select>
  <SelectPopover>
    <SelectHeading />
    <SelectDismiss />
    <SelectList>
      <SelectGroup>
        <SelectGroupLabel />
        <SelectRow>
          <SelectItem>
            <SelectItemCheck />
          </SelectItem>
          <SelectSeparator />
        </SelectRow>
      </SelectGroup>
    </SelectList>
  </SelectPopover>
</SelectProvider>
```

## Styling

### Styling the active item

When browsing the list with a keyboard (or hovering over items with the mouse when the [`focusOnHover`](/reference/select-item#focusonhover) prop is `true`), the active item element will have a `data-active-item` attribute. You can use this attribute to style the active item:

```css
.select-item[data-active-item] {
  background-color: hsl(204 100% 40%);
  color: white;
}
```

Learn more on the [Styling](/guide/styling) guide.

## Related components

<div data-cards="components">

- [](/components/button)
- [](/components/combobox)
- [](/components/form)
- [](/components/menu)
- [](/components/popover)
- [](/components/composite)

</div>
