import { test, expect, type Page, type Locator } from "@playwright/test";

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

// Creates a routine and returns to /routines
async function createRoutine(page: Page, name: string) {
  await page.goto("/routines/create");

  // Fill in routine name
  await page.locator('input[placeholder="Routine Title"]').fill(name);

  // Add an exercise
  await page.click("text=Add Exercise");
  const searchInput = page.locator(
    'input[placeholder="Search 200+ exercises..."]',
  );
  await searchInput.fill("bench press");
  const firstResult = page.locator(".divide-y button").first();
  await expect(firstResult).toBeVisible({ timeout: 5000 });
  await firstResult.click();

  // Click Finish to save, wait for redirect to /routines (not /routines/create)
  await page.getByRole("button", { name: "Finish" }).click();
  await page.waitForURL(/\/routines$/, { timeout: 10000 });
}

// Finds a routine card by its h3 heading name
function findRoutineCard(page: Page, name: string) {
  return page
    .locator(".rounded-lg.border")
    .filter({ has: page.getByRole("heading", { name, level: 3 }) })
    .first();
}

// Returns the workout modal locator
function getWorkoutModal(page: Page): Locator {
  return page.getByTestId("workout-modal");
}

test.describe("Workout Flow", () => {
  const routineName = `Test Routine ${Date.now()}`;
  let routineCreated = false;

  test.beforeEach(async ({ page }) => {
    await login(page);

    // Create the routine once on first test run
    if (!routineCreated) {
      await createRoutine(page, routineName);
      routineCreated = true;
    }
  });

  test("should start a workout from the routines page", async ({ page }) => {
    await page.goto("/routines");

    // Find the routine card and click Start
    const routineCard = findRoutineCard(page, routineName);
    await expect(routineCard).toBeVisible({ timeout: 5000 });

    await routineCard.getByRole("button", { name: /Start/ }).click();

    // Workout modal should appear in expanded view
    const modal = getWorkoutModal(page);
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Verify the workout name is shown in the modal header
    await expect(
      modal.locator("h1", { hasText: routineName }),
    ).toBeVisible();

    // Verify exercise sets are visible
    await expect(modal.locator("text=kg").first()).toBeVisible();
    await expect(modal.locator("text=Reps").first()).toBeVisible();

    // Cancel the workout so it doesn't interfere with other tests
    await modal.getByRole("button", { name: "Cancel" }).click();
    await expect(modal.locator("text=Cancel?")).toBeVisible();
    await modal.getByRole("button", { name: "Yes" }).click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  test("should minimize and expand the workout modal", async ({ page }) => {
    await page.goto("/routines");

    // Start the workout
    const routineCard = findRoutineCard(page, routineName);
    await routineCard.getByRole("button", { name: /Start/ }).click();

    // Wait for expanded modal
    const modal = getWorkoutModal(page);
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Click minimize
    await modal.getByRole("button", { name: "Minimize workout" }).click();

    // Expanded modal should be gone, minimized bar should show set progress
    await expect(modal).not.toBeVisible();
    await expect(page.locator("text=/\\d+\\/\\d+ sets/")).toBeVisible();

    // Click the minimized bar to expand again
    await page.locator("text=/\\d+\\/\\d+ sets/").click();
    await expect(modal).toBeVisible();

    // Clean up: cancel workout
    await modal.getByRole("button", { name: "Cancel" }).click();
    await modal.getByRole("button", { name: "Yes" }).click();
  });

  test("should finish a workout", async ({ page }) => {
    await page.goto("/routines");

    // Start the workout
    const routineCard = findRoutineCard(page, routineName);
    await routineCard.getByRole("button", { name: /Start/ }).click();

    const modal = getWorkoutModal(page);
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Click Finish and confirm
    await modal.getByRole("button", { name: "Finish" }).click();
    await expect(modal.locator("text=Finish?")).toBeVisible();
    await modal.getByRole("button", { name: "Yes" }).click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  test("should cancel a workout with confirmation", async ({ page }) => {
    await page.goto("/routines");

    // Start the workout
    const routineCard = findRoutineCard(page, routineName);
    await routineCard.getByRole("button", { name: /Start/ }).click();

    const modal = getWorkoutModal(page);
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Click Cancel
    await modal.getByRole("button", { name: "Cancel" }).click();
    await expect(modal.locator("text=Cancel?")).toBeVisible();

    // Click No to dismiss
    await modal.getByRole("button", { name: "No" }).click();
    await expect(modal.locator("text=Cancel?")).not.toBeVisible();

    // Modal should still be open
    await expect(modal).toBeVisible();

    // Now actually cancel
    await modal.getByRole("button", { name: "Cancel" }).click();
    await modal.getByRole("button", { name: "Yes" }).click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });
});
