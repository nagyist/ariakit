import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import chalk from "chalk";
import fse from "fs-extra";
import { camelCase, groupBy } from "lodash-es";
import invariant from "tiny-invariant";
import { nonNullable } from "../lib/non-nullable.js";
import {
  getPageEntryFiles,
  getPageEntryFilesCached,
} from "./get-page-entry-files.js";
import { getPageExternalDeps } from "./get-page-external-deps.js";
import { getPageName } from "./get-page-name.js";
import { getPageSections } from "./get-page-sections.js";
import { getPageSourceFiles } from "./get-page-source-files.js";
import { getReferences } from "./reference-utils.js";

/** @param {string} [buildDir] */
function getBuildDir(buildDir) {
  return buildDir || join(process.cwd(), ".pages");
}

/** @param {string} path */
function pathToImport(path) {
  const projectRoot = new URL("../..", import.meta.url);
  return path.replace(projectRoot.pathname, "").replace(/\\/g, "/");
}

/**
 * @param {string} file
 * @param {string} contents
 */
function writeFileIfNeeded(file, contents) {
  try {
    const prevContents = readFileSync(file, "utf8");
    if (prevContents === contents) return;
  } catch {}
  writeFileSync(file, contents);
}

/**
 * @param {string} buildDir
 * @param {import("./types.js").Page[]} pages
 */
function writeFiles(buildDir, pages) {
  performance.mark("writeFiles:start");

  const otherPages = pages.filter((page) => !page.reference);

  const entryFiles = otherPages.flatMap((page) =>
    getPageEntryFilesCached(page),
  );

  const sourceFiles = entryFiles.reduce(
    /** @param {Record<string, string[]>} acc */ (acc, file) => {
      acc[file] = getPageSourceFiles(file);
      return acc;
    },
    {},
  );

  const referencePages = pages.filter((page) => page.reference);

  const referenceObjects = referencePages.flatMap((page) =>
    getPageEntryFilesCached(page).flatMap((file) => ({
      page,
      references: getReferences(file),
    })),
  );

  // deps.ts
  /** @type {Record<string, string>} */
  let deps = {};

  for (const file of entryFiles) {
    const fileDeps = getPageExternalDeps(file);
    deps = { ...deps, ...fileDeps };
  }

  const depsFile = join(buildDir, "deps.ts");

  const depsContents = `export default {\n${Object.keys(deps)
    .map((key) => `  "${key}": () => import("${key}") as unknown`)
    .join(",\n")}\n};\n`;

  writeFileIfNeeded(depsFile, depsContents);

  // examples.js
  const sourceFilesWithoutAppDir = Object.values(sourceFiles)
    .flat()
    .filter((file) => !file.startsWith(process.cwd()));
  const examples = [...new Set(sourceFilesWithoutAppDir)];
  const examplesFile = join(buildDir, "examples.js");

  const examplesContents = `// @ts-nocheck\nimport { lazy } from "react";\nimport { lazy as solidLazy } from "solid-js";\n\nexport default {\n${examples
    .map(
      (path) =>
        `  "${path}": ${path.includes(".solid.") ? "solidLazy" : "lazy"}(() => import("${pathToImport(path)}"))`,
    )
    .join(",\n")}\n};\n`;

  writeFileIfNeeded(examplesFile, examplesContents);

  // index.json and contents.json
  const markdownFiles = entryFiles.filter((file) => file.endsWith(".md"));

  const indexFile = join(buildDir, "index.json");
  const contentsFile = join(buildDir, "contents.json");

  const meta = markdownFiles.map((file) => {
    const page = otherPages.find((page) => {
      const context = Array.isArray(page.sourceContext)
        ? page.sourceContext
        : [page.sourceContext];
      return context.some((context) => file.startsWith(context));
    });
    if (!page) throw new Error(`Could not find page for file: ${file}`);
    return getPageSections(file, page.slug, page.getGroup);
  });

  for (const { page, references } of referenceObjects) {
    const sections = references.map((reference) => {
      return getPageSections(reference, page.slug, page.getGroup);
    });
    meta.push(...sections);
  }

  const categories = groupBy(meta, (page) => page.category);
  const contents = meta
    .filter((page) => !page.unlisted)
    .flatMap((page) => page.sections)
    .filter(
      (section) =>
        section.title === "Getting started" ||
        section.section !== "Installation",
    );

  const index = Object.entries(categories).reduce(
    /** @param {Record<string, Omit<(typeof meta)[0], "sections">[]>} acc */
    (acc, [category, pages]) => {
      acc[category] = pages.map(({ sections, ...page }) => page);
      return acc;
    },
    {},
  );

  writeFileIfNeeded(indexFile, JSON.stringify(index));
  writeFileIfNeeded(contentsFile, JSON.stringify(contents));

  // links.json
  const linksFile = join(buildDir, "links.json");

  const links = meta.map((page) => ({
    path: `/${page.category}/${page.slug}`,
    hashes: page.sections
      .map((section) => section.sectionId)
      .filter(nonNullable),
  }));

  links.unshift(
    { path: "/", hashes: [] },
    ...Object.keys(categories).map((category) => ({
      path: `/${category}`,
      hashes: [],
    })),
  );

  writeFileIfNeeded(linksFile, JSON.stringify(links));

  // icons.ts
  const iconsFile = join(buildDir, "icons.ts");

  // First pass: find icons in the same folder
  const icons = markdownFiles.reduce(
    /** @param {Record<string, string | null>} acc */
    (acc, file) => {
      const iconPath = join(dirname(file), "site-icon.tsx");
      acc[file] = existsSync(iconPath) ? iconPath : null;
      return acc;
    },
    {},
  );

  // Second pass: find icons in the same folder as the source file
  for (const [file, iconPath] of Object.entries(icons)) {
    if (iconPath) continue;
    const sourceFile = sourceFiles[file]?.[0];
    if (!sourceFile) continue;
    const sourceIconPath = join(dirname(sourceFile), "site-icon.tsx");
    if (!existsSync(sourceIconPath)) continue;
    icons[file] = sourceIconPath;
  }

  // Third pass: find icons in the same folder as the original component page
  for (const [file, iconPath] of Object.entries(icons)) {
    if (iconPath) continue;
    const key = Object.keys(icons)
      .filter((key) => !!icons[key])
      .find((key) => {
        const pageName = getPageName(key);
        const currentPageName = getPageName(file);
        return currentPageName.startsWith(pageName);
      });
    if (!key) continue;
    icons[file] = icons[key] || null;
  }

  const iconsContents = Object.entries(icons)
    .map(([file, iconPath]) => {
      const category = pages.find((page) => {
        const context = Array.isArray(page.sourceContext)
          ? page.sourceContext
          : [page.sourceContext];
        return context.some((context) => file.startsWith(context));
      });
      invariant(category);
      const pageName = getPageName(file);
      return iconPath
        ? `export { default as ${camelCase(
            `${category.slug}/${pageName}`,
          )} } from "${pathToImport(iconPath)}";\n`
        : "";
    })
    .join("");

  writeFileIfNeeded(iconsFile, iconsContents);

  // images.ts
  const imagesFile = join(buildDir, "images.ts");
  const sizes = ["small", "medium", "large"];
  const modes = ["light", "dark"];

  const images = markdownFiles.reduce(
    /** @param {Record<string, string[]>} acc */
    (acc, file) => {
      const images = sizes.flatMap((size) =>
        modes.map((mode) => join(dirname(file), `images/${size}-${mode}.png`)),
      );
      acc[file] = images.filter((image) => existsSync(image));
      return acc;
    },
    {},
  );

  const imagesContents = Object.entries(images)
    .map(([file, imagePaths]) => {
      const category = pages.find((page) => {
        const context = Array.isArray(page.sourceContext)
          ? page.sourceContext
          : [page.sourceContext];
        return context.some((context) => file.startsWith(context));
      });
      invariant(category);
      const pageName = getPageName(file);
      return imagePaths
        .map((imagePath) => {
          return `export { default as ${camelCase(
            `${category.slug}/${pageName}/${basename(imagePath, ".png")}`,
          )} } from "${pathToImport(imagePath)}";\n`;
        })
        .join("");
    })
    .join("");

  writeFileIfNeeded(imagesFile, imagesContents);

  performance.mark("writeFiles:end");
  const { duration } = performance.measure(
    "writeFiles",
    "writeFiles:start",
    "writeFiles:end",
  );
  console.log(
    `${chalk.green("pages")} - wrote pages in ${Math.round(duration)}ms`,
  );
}

class PagesWebpackPlugin {
  /**
   * @param {object} options
   * @param {string} options.buildDir The directory where the build files should
   * be placed.
   * @param {import("./types.js").Page[]} options.pages
   */
  constructor(options) {
    this.buildDir = getBuildDir(options.buildDir);
    this.pages = options.pages;
    // rimrafSync(this.buildDir);
    fse.ensureDirSync(this.buildDir);
    writeFiles(this.buildDir, this.pages);
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    const pages = this.pages;
    const contexts = pages.flatMap((page) => page.sourceContext);
    const contextsWithPages = pages.flatMap((page) => {
      const contexts = Array.isArray(page.sourceContext)
        ? page.sourceContext
        : [page.sourceContext];
      return contexts.map((context) => ({ context, page }));
    });

    const externalContexts = contexts.filter(
      (context) => !context.startsWith(process.cwd()),
    );

    compiler.options.module.rules.push({
      issuer: (value) =>
        externalContexts.some((exclude) => value.startsWith(exclude)),
      include: externalContexts,
      test: /style\.css$/,
      loader: "null-loader",
    });

    compiler.hooks.make.tap("PagesWebpackPlugin", (compilation) => {
      if (!compiler.watchMode) return;
      for (const { context, page } of contextsWithPages) {
        compilation.contextDependencies.add(context);
        for (const file of getPageEntryFiles(context, page.pageFileRegex)) {
          compilation.fileDependencies.add(file);
          compilation.contextDependencies.add(dirname(file));
        }
      }
    });

    compiler.hooks.watchRun.tap("PagesWebpackPlugin", (compiler) => {
      const { modifiedFiles, removedFiles } = compiler;
      if (!modifiedFiles) return;
      if (!removedFiles) return;

      /** @param {string} file */
      const log = (file, removed = false) => {
        console.log(
          `${
            removed ? chalk.red("removed page") : chalk.yellow("updated page")
          } - ${file}`,
        );
      };

      for (const file of removedFiles) {
        if (!contexts.some((context) => file.includes(context))) continue;
        log(file, true);
        return writeFiles(this.buildDir, pages);
      }

      if (modifiedFiles.size === 1) {
        const context = contexts.find((context) => modifiedFiles.has(context));
        if (context) {
          log(context);
          return writeFiles(this.buildDir, pages);
        }
      }

      for (const file of modifiedFiles) {
        if (contexts.some((context) => file === context)) continue;
        if (!contexts.some((context) => file.includes(context))) continue;
        log(file);
        return writeFiles(this.buildDir, pages);
      }
    });
  }
}

export default PagesWebpackPlugin;
