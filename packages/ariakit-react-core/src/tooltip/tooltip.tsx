import { contains } from "@ariakit/core/utils/dom";
import { invariant, isFalsyBooleanCallback } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import { createDialogComponent } from "../dialog/dialog.tsx";
import type { HovercardOptions } from "../hovercard/hovercard.tsx";
import { useHovercard } from "../hovercard/hovercard.tsx";
import { useWrapElement } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import {
  TooltipScopedContextProvider,
  useTooltipProviderContext,
} from "./tooltip-context.tsx";
import type { TooltipStore } from "./tooltip-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `Tooltip` component.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const store = useToolTipStore();
 * const props = useTooltip({ store });
 * <TooltipAnchor store={store}>Anchor</TooltipAnchor>
 * <Role {...props}>Tooltip</Role>
 * ```
 */
export const useTooltip = createHook<TagName, TooltipOptions>(
  function useTooltip({
    store,
    portal = true,
    gutter = 8,
    preserveTabOrder = false,
    hideOnHoverOutside = true,
    hideOnInteractOutside = true,
    ...props
  }) {
    const context = useTooltipProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Tooltip must receive a `store` prop or be wrapped in a TooltipProvider component.",
    );

    props = useWrapElement(
      props,
      (element) => (
        <TooltipScopedContextProvider value={store}>
          {element}
        </TooltipScopedContextProvider>
      ),
      [store],
    );

    const role = store.useState((state) =>
      state.type === "description" ? "tooltip" : "none",
    );

    props = { role, ...props };

    props = useHovercard({
      ...props,
      store,
      portal,
      gutter,
      preserveTabOrder,
      hideOnHoverOutside(event) {
        if (isFalsyBooleanCallback(hideOnHoverOutside, event)) return false;
        const anchorElement = store?.getState().anchorElement;
        if (!anchorElement) return true;
        // If the anchor element has the `data-focus-visible` attribute (added
        // by the `Focusable` component that is used by several components), we
        // don't hide the tooltip when the mouse leaves the anchor element. In
        // this case, the tooltip will be hidden only if the user presses the
        // Escape key or if the anchor element loses focus.
        if ("focusVisible" in anchorElement.dataset) return false;
        return true;
      },
      hideOnInteractOutside: (event) => {
        if (isFalsyBooleanCallback(hideOnInteractOutside, event)) return false;
        const anchorElement = store?.getState().anchorElement;
        if (!anchorElement) return true;
        // Prevent hiding the tooltip when the user interacts with the anchor
        // element. It's up to the developer to hide the tooltip when the user
        // clicks on the anchor element if that's the intended behavior.
        if (contains(anchorElement, event.target as Node)) return false;
        return true;
      },
    });

    return props;
  },
);

/**
 * Renders a tooltip element that visually describes a
 * [`TooltipAnchor`](https://ariakit.org/reference/tooltip-anchor) when it
 * receives focus or is hovered.
 *
 * The tooltip is strictly for visual purposes. It's your responsibility to
 * ensure the anchor element has an accessible name. See [Tooltip anchors must
 * have accessible
 * names](https://ariakit.org/components/tooltip#tooltip-anchors-must-have-accessible-names)
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx {3}
 * <TooltipProvider>
 *   <TooltipAnchor>Anchor</TooltipAnchor>
 *   <Tooltip>Tooltip</Tooltip>
 * </TooltipProvider>
 * ```
 */
export const Tooltip = createDialogComponent(
  forwardRef(function Tooltip(props: TooltipProps) {
    const htmlProps = useTooltip(props);
    return createElement(TagName, htmlProps);
  }),
  useTooltipProviderContext,
);

export interface TooltipOptions<T extends ElementType = TagName>
  extends HovercardOptions<T> {
  /**
   * Object returned by the
   * [`useTooltipStore`](https://ariakit.org/reference/use-tooltip-store) hook.
   * If not provided, the closest
   * [`TooltipProvider`](https://ariakit.org/reference/tooltip-provider)
   * component's context will be used.
   */
  store?: TooltipStore;
  /**
   * @default true
   */
  portal?: HovercardOptions<T>["portal"];
  /**
   * @default 8
   */
  gutter?: HovercardOptions<T>["gutter"];
}

export type TooltipProps<T extends ElementType = TagName> = Props<
  T,
  TooltipOptions<T>
>;
