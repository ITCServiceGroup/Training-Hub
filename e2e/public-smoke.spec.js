import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("public learning entry points render and keyboard navigation is available", async ({
  page,
}) => {
  await page.goto("/#/");

  await expect(page).toHaveTitle("Training Hub");
  await expect(
    page.getByRole("heading", { name: /welcome to training hub/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Learn", exact: true }).first(),
  ).toHaveAttribute("href", /#\/study/);

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("protected admin routes fail closed to the login page", async ({
  page,
}) => {
  await page.goto("/#/admin");
  await expect(page).toHaveURL(/#\/login$/);
  await expect(
    page.getByRole("heading", { name: "Welcome Back" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  await expect(page.getByLabel("Keep me signed in")).toHaveCount(0);
});

test("legacy access-code links are scrubbed from browser history URLs", async ({
  page,
}) => {
  await page.goto("/#/quiz/access/SECRET123");
  await expect(page).toHaveURL(/#\/quiz\/access$/);
  expect(page.url()).not.toContain("SECRET123");
});

test("mobile navigation exposes its expanded state and closes after navigation", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "mobile project only");
  await page.goto("/#/");

  const menuButton = page.getByRole("button", { name: "Toggle menu" });
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(
    page
      .locator("#mobile-primary-navigation")
      .getByRole("link", { name: "Home" }),
  ).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton).toBeFocused();

  await menuButton.click();

  await page
    .locator("#mobile-primary-navigation")
    .getByRole("link", { name: "Learn" })
    .click();
  await expect(page).toHaveURL(/#\/study$/);
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
});

test("@a11y public home has no serious or critical axe violations", async ({
  page,
}) => {
  await page.goto("/#/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blockingViolations = results.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );
  expect(blockingViolations).toEqual([]);
});
