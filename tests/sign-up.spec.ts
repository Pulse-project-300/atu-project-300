import { test, expect } from "@playwright/test";

test.describe("Sign Up Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-up");
  });

  test("should display sign up form with all required fields", async ({
    page,
  }) => {
    // Verify heading and description
    await expect(page.getByText("Sign up", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Create a new account")).toBeVisible();

    // Verify Google sign up button
    await expect(
      page.getByRole("button", { name: "Sign up with Google" }),
    ).toBeVisible();

    // Verify all form inputs are present
    await expect(page.locator("#firstName")).toBeVisible();
    await expect(page.locator("#lastName")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#repeat-password")).toBeVisible();

    // Verify submit button
    await expect(
      page.getByRole("button", { name: "Sign up", exact: true }),
    ).toBeVisible();

    // Verify login link for existing users
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  });

  test("should navigate to login page when Login link is clicked", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
