import { test, expect } from "@playwright/test";

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;
if (!email || !password) {
  throw new Error(
    "Environment variables TEST_USER_EMAIL and TEST_USER_PASSWORD must be set.",
  );
}

test.describe("Login", () => {
  test("login authentication", async ({ page }) => {
    await page.goto("/login");
    // Fill in credentials
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click("button[type=submit]");
    // Verify successful login
    await expect(page).toHaveURL(/dashboard/);
  });
});
