import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should load the landing page successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Pulse");
    await expect(page.locator("text=Sign In")).toBeVisible();
    await expect(page.locator("text=Sign Up")).toBeVisible();
  });

  test("simple test - page loads and has Pulse branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Pulse/i);
    await expect(page.getByRole("link", { name: "Pulse" })).toBeVisible();
  });
});
