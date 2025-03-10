import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

const getMenuButton = (locator: Page | Locator) =>
  locator.getByRole("button", { name: "Options" });

const getMenu = (locator: Page | Locator, name: string) =>
  locator.getByRole("menu", { name });

const getMenuWrapper = (locator: Page) =>
  getMenu(locator, "Options").locator("..");

const getMenuItem = (
  locator: Page | Locator,
  name: string,
  role = "menuitem",
) => locator.locator(`role=${role}[name='${name}']`);

test("show/hide with click", async ({ page }) => {
  test.info().snapshotSuffix = "";
  await getMenuButton(page).click();
  await expect(getMenu(page, "Options")).toBeVisible();
  const wrapper = await getMenuWrapper(page).elementHandle();
  await getMenuItem(page, "History").click();
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth,
    wrapper!,
  );
  await expect(getMenu(page, "History")).toBeVisible();
  expect(await wrapper?.screenshot()).toMatchSnapshot();
  await page.waitForTimeout(500);
  await getMenuItem(page, "Recently closed windows").click();
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth * 2,
    wrapper!,
  );
  await getMenuItem(
    getMenu(page, "Recently closed windows"),
    "Back to parent menu",
  ).click();
  await expect(getMenu(page, "Recently closed windows")).toBeHidden();
  await getMenuItem(getMenu(page, "History"), "Back to parent menu").click();
  await page.waitForFunction((wrapper) => wrapper.scrollLeft === 0, wrapper!);
  await expect(getMenu(page, "History")).toBeHidden();
});

test("show/hide with keyboard", async ({ page }) => {
  await getMenuButton(page).focus();
  await page.keyboard.press("ArrowDown");
  await expect(getMenuItem(page, "New Tab")).toBeFocused();
  const wrapper = await getMenuWrapper(page).elementHandle();
  await page.keyboard.type("h");
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth,
    wrapper!,
  );
  await expect(
    getMenuItem(getMenu(page, "History"), "Back to parent menu"),
  ).toBeFocused();
  await page.keyboard.type("rr");
  await page.waitForTimeout(500);
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth * 2,
    wrapper!,
  );
  await page.keyboard.press(" ");
  await page.waitForFunction(
    (wrapper) => wrapper.scrollLeft === wrapper.clientWidth,
    wrapper!,
  );
});
