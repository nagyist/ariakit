---
tags:
  - Disclosure
---

# Disclosure

<div data-description>

Click a button to either [`show`](/reference/use-disclosure-store#show) (expand, open) or [`hide`](/reference/use-disclosure-store#hide) (collapse, close) a content element in React. This component is based on the [WAI-ARIA Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

</div>

<div data-tags></div>

<a href="../examples/disclosure/index.react.tsx" data-playground>Example</a>

## Examples

<div data-cards="examples">

- [](/examples/disclosure-animated)

</div>

## API

```jsx
useDisclosureStore()
useDisclosureContext()

<DisclosureProvider>
  <Disclosure />
  <DisclosureContent />
</DisclosureProvider>
```

## Styling

### Styling the expanded state

You can use the `aria-expanded` attribute to style the expanded state:

```css
.disclosure[aria-expanded="true"] {
  color: red;
}
```

Learn more on the [Styling](/guide/styling) guide.
