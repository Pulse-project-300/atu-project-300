import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("login authentication", async ({ page }) => {
    await page.goto("/login");
    // Fill in credentials
    await page.fill("#email", "testuser@test.com");
    await page.fill("#password", "testpassword");
    await page.click("button[type=submit]");
    // Verify successful login
    await expect(page).toHaveURL(/dashboard/);
  });
});
