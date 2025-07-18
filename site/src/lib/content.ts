import type { CollectionEntry } from "astro:content";
import { invariant } from "@ariakit/core/utils/misc";
import { isFramework } from "./frameworks.ts";

interface ContentGroup {
  label: string;
  path: string | ((framework: Framework) => string);
}

const contentGroups: Record<string, ContentGroup> = {
  "ariakit-react": {
    label: "Components",
    path: (framework) => `${framework}/components`,
  },
  "ariakit-solid": {
    label: "Components",
    path: (framework) => `${framework}/components`,
  },
  "ariakit-tailwind": {
    label: "Styles",
    path: "styles",
  },
  examples: {
    label: "Examples",
    path: "examples",
  },
};

function getGroupPath(group: ContentGroup, framework?: Framework) {
  if (typeof group.path === "string") {
    return group.path;
  }
  invariant(framework, "Framework is required to get the group path");
  return group.path(framework);
}

export function getGuideDetail(entry: CollectionEntry<"guides">) {
  const [groupKey, id] = entry.id.split("/");
  invariant(groupKey, "Guide must belong to a group or framework");
  invariant(id, "Guide must have an id");
  const group = contentGroups[groupKey];
  invariant(
    group,
    `Invalid group key. Must be one of: ${Object.keys(contentGroups).join(", ")}`,
  );
  const segments = groupKey.split("-");
  const framework = segments.find((segment) => isFramework(segment));
  const groupPath = `/${getGroupPath(group, framework)}`;
  const path = `${groupPath}/${id}`;
  return { ...entry, path, framework, groupLabel: group.label, groupPath };
}

export function filterGuidesByGroup(groupPath: string) {
  return (entry: CollectionEntry<"guides">) => {
    const guide = getGuideDetail(entry);
    return guide.groupPath === groupPath;
  };
}

export function getGalleryLength(
  examples: CollectionEntry<"examples">[],
  galleries: CollectionEntry<"galleries">[],
) {
  return examples.reduce((acc, example) => {
    const gallery = galleries.find((g) => g.id === example.id);
    return acc + (gallery?.data.length || 1);
  }, 0);
}
