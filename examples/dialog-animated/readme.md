---
tags:
  - Dialog
  - Button
  - Animated
  - CSS transitions
---

# Animated Dialog

<div data-description>

Animating a modal [Dialog](/components/dialog) and its [`backdrop`](/reference/dialog#backdrop) element using CSS. The component waits for the transition to finish before completely hiding the dialog or removing it from the React tree.

</div>

<div data-tags></div>

<a href="./index.react.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)
- [](/components/button)

</div>

## Styling

Use the `data-enter` and `data-leave` attributes to animate the dialog and the backdrop elements:

```css
.backdrop {
  opacity: 0;
  transition: opacity 200ms;
}

.backdrop[data-enter] {
  opacity: 1;
}

.dialog {
  transform: scale(0.95);
  transition: transform 200ms;
}

.dialog[data-enter] {
  transform: scale(1);
}
```

You can learn more about these `data-*` attributes on the [Styling](/guide/styling) guide.

## Related examples

<div data-cards="examples">

- [](/examples/disclosure-animated)
- [](/examples/combobox-animated)
- [](/examples/select-animated)
- [](/examples/tab-panel-animated)
- [](/examples/dialog-combobox-tab-command-menu)
- [](/examples/menubar-navigation)

</div>
