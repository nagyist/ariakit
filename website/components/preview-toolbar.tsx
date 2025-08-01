import { track } from "@vercel/analytics/react";
import Link from "next/link.js";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { twJoin, twMerge } from "tailwind-merge";
import { NewWindow } from "@/icons/new-window.tsx";
import { Nextjs } from "@/icons/nextjs.tsx";
import { Vite } from "@/icons/vite.tsx";
import { openInStackblitz } from "@/lib/stackblitz.ts";
import { useSubscription } from "@/lib/use-subscription.ts";
import { Command } from "./command.tsx";
import { TooltipButton } from "./tooltip-button.tsx";

type Language = "ts" | "js";

export interface PreviewToolbarProps extends ComponentPropsWithoutRef<"div"> {
  exampleId: string;
  files: Record<string, string>;
  javascriptFiles?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  language?: Language;
}

export const PreviewToolbar = forwardRef<HTMLDivElement, PreviewToolbarProps>(
  function PreviewToolbar(
    {
      exampleId,
      files,
      javascriptFiles,
      dependencies,
      devDependencies,
      language,
      ...props
    },
    ref,
  ) {
    const isJS = language === "js";
    const [firstFile] = Object.keys(files);
    const isAppDir =
      !!firstFile && /^(page|layout)\.[mc]?[tj]sx?/.test(firstFile);

    const subscription = useSubscription();
    const hasSubscription = !!subscription.data;

    const onStackblitzClick = (template: "vite" | "next") => {
      if (!hasSubscription) return;
      return () => {
        track("edit-on-stackblitz", { template, exampleId });
        const isDark = document.documentElement.classList.contains("dark");
        openInStackblitz({
          template,
          id: exampleId,
          files: (isJS && javascriptFiles) || files,
          dependencies,
          devDependencies,
          theme: isDark ? "dark" : "light",
        });
      };
    };

    const isRadix = /-radix/.test(exampleId);

    const buttonClassName = twJoin(
      "h-8 rounded-md pl-2 pr-3 text-sm hover:cursor-pointer",
      isRadix
        ? "dark:bg-white/10 dark:hover:bg-white/[15%]"
        : "bg-gray-250 hover:bg-gray-300",
    );

    return (
      <div
        ref={ref}
        {...props}
        className={twMerge("flex items-center gap-1.5", props.className)}
      >
        <span
          className={twJoin(
            "text-sm font-medium text-black dark:text-white",
            isRadix ? "opacity-90" : "opacity-70",
          )}
        >
          Edit with
        </span>
        {!isAppDir && (
          <TooltipButton
            title={
              <div className="flex items-center gap-1">
                Edit example with Vite{" "}
                <NewWindow className="h-4 w-4 opacity-60" />
              </div>
            }
            onClick={onStackblitzClick("vite")}
            className={buttonClassName}
            render={
              <Command
                flat
                render={
                  !hasSubscription ? (
                    <Link href="/plus?feature=edit-examples" scroll={false} />
                  ) : undefined
                }
              />
            }
          >
            <Vite className="h-4 w-4" />
            Vite
          </TooltipButton>
        )}
        <TooltipButton
          title={
            <div className="flex items-center gap-1">
              Edit example with Next.js{" "}
              <NewWindow className="h-4 w-4 opacity-60" />
            </div>
          }
          onClick={onStackblitzClick("next")}
          className={buttonClassName}
          render={
            <Command
              flat
              render={
                !hasSubscription ? (
                  <Link href="/plus?feature=edit-examples" scroll={false} />
                ) : undefined
              }
            />
          }
        >
          <Nextjs className="h-4 w-4" />
          Next.js
        </TooltipButton>
      </div>
    );
  },
);
