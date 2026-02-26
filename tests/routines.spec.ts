import { test, expect, type Page } from "@playwright/test";

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;
if (!email || !password) {
  throw new Error(
    "Environment variables TEST_USER_EMAIL and TEST_USER_PASSWORD must be set.",
  );
}

async function login(page: Page) {
  await page.goto("/login");
  await page.fill("#email", email!);
  await page.fill("#password", password!);
  await page.click("button[type=submit]");
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
}

test.describe("Routines", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should navigate to routines page from dashboard", async ({ page }) => {
    await page.click("text=Routines");
    await expect(page).toHaveURL(/\/routines/);
    await expect(page.locator("h1")).toHaveText("Routines");
  });

  test("should navigate to create routine page", async ({ page }) => {
    await page.goto("/routines");
    await page.click("text=New Routine");
    await expect(page).toHaveURL(/\/routines\/create/);
    await expect(page.locator("h1")).toHaveText("New Routine");
  });

  test("should display routine title and description inputs on create page", async ({
    page,
  }) => {
    await page.goto("/routines/create");

    const titleInput = page.locator('input[placeholder="Routine Title"]');
    const descriptionInput = page.locator(
      'textarea[placeholder="Routine description..."]',
    );

    await expect(titleInput).toBeVisible();
    await expect(descriptionInput).toBeVisible();
  });

  test("should fill in routine title and description", async ({ page }) => {
    await page.goto("/routines/create");

    const titleInput = page.locator('input[placeholder="Routine Title"]');
    const descriptionInput = page.locator(
      'textarea[placeholder="Routine description..."]',
    );

    await titleInput.fill("My Test Routine");
    await expect(titleInput).toHaveValue("My Test Routine");

    await descriptionInput.fill("A basic test routine");
    await expect(descriptionInput).toHaveValue("A basic test routine");
  });

  test("should have Finish button disabled when form is empty", async ({
    page,
  }) => {
    await page.goto("/routines/create");

    const finishButton = page.getByRole("button", { name: "Finish" });
    await expect(finishButton).toBeDisabled();
  });

  test("should open exercise search when Add Exercise is clicked", async ({
    page,
  }) => {
    await page.goto("/routines/create");

    await page.click("text=Add Exercise");

    const searchInput = page.locator(
      'input[placeholder="Search 200+ exercises..."]',
    );
    await expect(searchInput).toBeVisible();
  });

  test("should search for an exercise and add it", async ({ page }) => {
    await page.goto("/routines/create");

    // Open exercise search
    await page.click("text=Add Exercise");

    // Type in the search box
    const searchInput = page.locator(
      'input[placeholder="Search 200+ exercises..."]',
    );
    await searchInput.fill("bench press");

    // Wait for search results and click the first one
    const firstResult = page.locator(".divide-y button").first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    // Verify the exercise was added (card with exercise name should appear)
    await expect(page.locator("text=Add Set").first()).toBeVisible();
  });

  test("should show set fields after adding an exercise", async ({ page }) => {
    await page.goto("/routines/create");

    // Add an exercise
    await page.click("text=Add Exercise");
    const searchInput = page.locator(
      'input[placeholder="Search 200+ exercises..."]',
    );
    await searchInput.fill("squat");
    const firstResult = page.locator(".divide-y button").first();
    await expect(firstResult).toBeVisible({ timeout: 5000 });
    await firstResult.click();

    // Verify set headers are visible
    await expect(page.locator("text=Weight kg").first()).toBeVisible();
    await expect(page.locator("text=Reps").first()).toBeVisible();

    // Should have 3 default sets
    const setNumbers = page.locator("text=Add Set");
    await expect(setNumbers.first()).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should navigate between main pages", async ({ page }) => {
    // Navigate to Routines
    await page.click("text=Routines");
    await expect(page).toHaveURL(/\/routines/);

    // Navigate to Analytics
    await page.click("text=Analytics");
    await expect(page).toHaveURL(/\/analytics/);

    // Navigate to Dashboard
    await page.click("text=Home");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should navigate to settings page", async ({ page }) => {
    await page.click('a[aria-label="Settings"]');
    await expect(page).toHaveURL(/\/settings/);
  });
});
