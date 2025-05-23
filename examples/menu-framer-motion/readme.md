---
tags:
  - Menu
  - Animated
  - Framer Motion
  - Dropdowns
  - Abstracted examples
---

# Menu with Framer Motion

<div data-description>

Abstracting [Menu](/components/menu) into a reusable dropdown menu component that uses [Framer Motion](https://www.framer.com/motion/) to create smooth initial and exit animations.

</div>

<div data-tags></div>

<a href="./index.react.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/menu)

</div>

## Controlling the Menu state

The [`useMenuStore`](/reference/use-menu-store) hook allows for the use of controlled props, such as [`open`](/reference/use-menu-store#open) and [`setOpen`](/reference/use-menu-store#setopen), which can be used to manage the state of the menu from outside the component. These props are compatible with React state and can be easily passed via props.

In this example, we use this method to expose a simpler API:

```jsx
function Menu({ open, setOpen }) {
  const menu = Ariakit.useMenuStore({ open, setOpen });
}
```

You can learn more about controlled state on the [Component stores](/guide/component-stores#controlled-state) guide.

## AnimatePresence

We use the [AnimatePresence](https://www.framer.com/motion/animate-presence/) component from Framer Motion to animate the Ariakit [Menu](/components/menu) component when it gets mounted and unmounted from the DOM.

```jsx
<AnimatePresence>
  {mounted && (
    <Ariakit.Menu store={menu} render={<motion.div />}>
      {children}
    </Ariakit.Menu>
  )}
</AnimatePresence>
```

To dynamically render the menu component, you can use the [`mounted`](/apis/use-menu-store#mounted) state that can be retrieved from the store:

```jsx
const menu = Ariakit.useMenuStore({ open, setOpen });
const mounted = Ariakit.useStoreState(menu, "mounted");
```

You can learn more about reading state from the store on the [Component stores](/guide/component-stores#reading-the-state) guide.

## Related examples

<div data-cards="examples">

- [](/examples/dialog-framer-motion)
- [](/examples/tooltip-framer-motion)
- [](/examples/menu-nested)
- [](/examples/menu-item-checkbox)
- [](/examples/menubar-navigation)
- [](/examples/dialog-combobox-command-menu)

</div>
