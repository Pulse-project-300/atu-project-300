import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto("/login");
  });

  test("should display login form with all elements", async ({ page }) => {
    // Verify the login card is visible
    await expect(page.getByTestId("login-card")).toBeVisible();

    // Verify title and description
    await expect(page.getByTestId("login-title")).toHaveText("Login");
    await expect(page.getByTestId("login-description")).toContainText(
      "Enter your email below to login"
    );

    // Verify Google login button
    await expect(page.getByTestId("google-login-button")).toBeVisible();
    await expect(page.getByTestId("google-login-button")).toHaveText(
      "Login with Google"
    );

    // Verify email and password inputs are visible
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("password-input")).toBeVisible();

    // Verify login submit button
    await expect(page.getByTestId("login-submit-button")).toBeVisible();
    await expect(page.getByTestId("login-submit-button")).toHaveText("Login");

    // Verify forgot password link
    await expect(page.getByTestId("forgot-password-link")).toBeVisible();

    // Verify sign up link
    await expect(page.getByTestId("sign-up-link")).toBeVisible();
  });

  test("should fill in email and password inputs", async ({ page }) => {
    const emailInput = page.getByTestId("email-input");
    const passwordInput = page.getByTestId("password-input");

    // Fill in email
    await emailInput.fill("test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");

    // Fill in password
    await passwordInput.fill("testpassword123");
    await expect(passwordInput).toHaveValue("testpassword123");
  });

  test("should show validation for empty form submission", async ({ page }) => {
    const submitButton = page.getByTestId("login-submit-button");

    // Try to submit without filling in fields
    await submitButton.click();

    // HTML5 validation should prevent submission
    // The email input should be focused and show validation
    const emailInput = page.getByTestId("email-input");
    await expect(emailInput).toBeFocused();
  });

  test("should navigate to sign up page when sign up link is clicked", async ({
    page,
  }) => {
    const signUpLink = page.getByTestId("sign-up-link");

    // Click sign up link
    await signUpLink.click();

    // Verify navigation to sign up page
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("should navigate to forgot password page when link is clicked", async ({
    page,
  }) => {
    const forgotPasswordLink = page.getByTestId("forgot-password-link");

    // Click forgot password link
    await forgotPasswordLink.click();

    // Verify navigation to forgot password page
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("should show error message for invalid credentials", async ({
    page,
  }) => {
    const emailInput = page.getByTestId("email-input");
    const passwordInput = page.getByTestId("password-input");
    const submitButton = page.getByTestId("login-submit-button");

    // Fill in invalid credentials
    await emailInput.fill("invalid@example.com");
    await passwordInput.fill("wrongpassword");

    // Submit the form
    await submitButton.click();

    // Wait for error message to appear
    const errorMessage = page.getByTestId("login-error");
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // Verify error message contains expected text
    await expect(errorMessage).toContainText(/invalid/i);
  });

  test("should disable buttons while logging in", async ({ page }) => {
    const emailInput = page.getByTestId("email-input");
    const passwordInput = page.getByTestId("password-input");
    const submitButton = page.getByTestId("login-submit-button");
    const googleButton = page.getByTestId("google-login-button");

    // Fill in credentials
    await emailInput.fill("test@example.com");
    await passwordInput.fill("testpassword123");

    // Click submit
    await submitButton.click();

    // Buttons should be disabled during login attempt
    await expect(submitButton).toBeDisabled();
    await expect(googleButton).toBeDisabled();

    // Submit button should show loading text
    await expect(submitButton).toContainText("Logging in...");
  });

  test("should have correct input types and attributes", async ({ page }) => {
    const emailInput = page.getByTestId("email-input");
    const passwordInput = page.getByTestId("password-input");

    // Check email input type
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toHaveAttribute("required");

    // Check password input type
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(passwordInput).toHaveAttribute("required");
  });
});
