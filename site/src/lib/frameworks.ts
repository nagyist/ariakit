/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type * as icons from "#app/icons/icons.ts";

type Frameworks = Record<
  string,
  {
    label: string;
    icon: keyof typeof icons;
    dependencies: string[];
    url: string;
  }
>;

export const frameworks = {
  astro: {
    label: "Astro",
    icon: "astro",
    dependencies: ["astro"],
    url: "https://astro.build",
  },
  html: {
    label: "HTML",
    icon: "html",
    dependencies: [],
    url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
  },
  preact: {
    label: "Preact",
    icon: "preact",
    dependencies: ["preact"],
    url: "https://preactjs.com",
  },
  react: {
    label: "React",
    icon: "react",
    dependencies: ["react", "react-dom"],
    url: "https://react.dev",
  },
  solid: {
    label: "Solid",
    icon: "solid",
    dependencies: ["solid-js"],
    url: "https://www.solidjs.com",
  },
  svelte: {
    label: "Svelte",
    icon: "svelte",
    dependencies: ["svelte"],
    url: "https://svelte.dev",
  },
  vue: {
    label: "Vue",
    icon: "vue",
    dependencies: ["vue"],
    url: "https://vuejs.org",
  },
  tailwind: {
    label: "Tailwind",
    icon: "tailwind",
    dependencies: ["tailwindcss"],
    url: "https://tailwindcss.com",
  },
} as const satisfies Frameworks;

export function isFramework(
  framework?: string,
): framework is keyof typeof frameworks {
  if (!framework) return false;
  return framework in frameworks;
}

export function isJsxFramework(framework?: string) {
  return (
    framework === "react" || framework === "solid" || framework === "preact"
  );
}

export function getFramework(framework: keyof typeof frameworks) {
  return frameworks[framework];
}

export function getFrameworkByFilename(
  filename: string,
): keyof typeof frameworks {
  if (filename.includes(".astro")) return "astro";
  if (filename.includes(".html")) return "html";
  if (filename.includes(".preact.tsx")) return "preact";
  if (filename.includes(".react.tsx")) return "react";
  if (filename.includes(".solid.tsx")) return "solid";
  if (filename.includes(".svelte")) return "svelte";
  if (filename.includes(".vue")) return "vue";
  return "html";
}
