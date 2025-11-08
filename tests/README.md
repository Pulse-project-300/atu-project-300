# Playwright Tests

This directory contains end-to-end tests for the Pulse fitness application using Playwright.

## Test Structure

- `landing.spec.ts` - Tests for the landing page
- `login.spec.ts` - Tests for the login functionality using data-testid selectors
- `auth.spec.ts` - Authentication flow tests
- `auth.setup.ts` - Authentication setup for authenticated tests
- `auth-authenticated.spec.ts` - Tests that require authentication

## Testing Conventions

### Using `data-testid` Attributes

We use `data-testid` attributes to create stable, maintainable test selectors that are independent of:
- CSS classes (which may change with styling updates)
- Text content (which may change with copy updates)
- DOM structure (which may change with refactoring)

#### Benefits of `data-testid`:
1. **Stability**: Tests won't break when styles or text change
2. **Clarity**: Explicit intent that an element is meant for testing
3. **Performance**: Faster selector queries than complex CSS selectors
4. **Maintainability**: Easy to find which elements are tested

#### Naming Convention:

Use kebab-case for `data-testid` values that describe the element's purpose:

```tsx
// ✅ Good examples
<button data-testid="login-submit-button">Login</button>
<input data-testid="email-input" type="email" />
<div data-testid="error-message">{error}</div>
<form data-testid="login-form">...</form>

// ❌ Bad examples
<button data-testid="btn1">Login</button>           // Not descriptive
<input data-testid="INPUT_EMAIL" type="email" />    // Wrong case
<div data-testid="the-error-message">{error}</div>  // Unnecessary words
```

#### Pattern: `{component}-{element}-{type}`

- `{component}`: The feature/component name (e.g., `login`, `signup`, `onboarding`)
- `{element}`: The specific element (e.g., `email`, `password`, `submit`)
- `{type}`: The element type (e.g., `button`, `input`, `link`, `form`)

Examples:
- `login-email-input`
- `login-submit-button`
- `signup-password-input`
- `onboarding-next-button`
- `profile-save-button`

### Using `data-testid` in Tests

In Playwright, use `getByTestId()` to select elements:

```typescript
import { test, expect } from "@playwright/test";

test("should login successfully", async ({ page }) => {
  await page.goto("/login");

  // Use getByTestId for all interactions
  await page.getByTestId("email-input").fill("user@example.com");
  await page.getByTestId("password-input").fill("password123");
  await page.getByTestId("login-submit-button").click();

  // Verify navigation or success
  await expect(page).toHaveURL(/\/dashboard/);
});
```

### When to Add `data-testid`

Add `data-testid` to elements that:
1. **User interacts with**: buttons, inputs, links, forms
2. **Display important state**: error messages, success notifications, loading indicators
3. **Navigate the user**: navigation links, menu items
4. **Contain critical content**: headings, titles, key data displays

Don't add `data-testid` to:
- Purely decorative elements
- Elements that will never be tested
- Container divs used only for layout

### Example: Login Form

```tsx
export function LoginForm() {
  return (
    <form data-testid="login-form" onSubmit={handleSubmit}>
      <h1 data-testid="login-title">Login</h1>

      <input
        data-testid="email-input"
        type="email"
        placeholder="Email"
      />

      <input
        data-testid="password-input"
        type="password"
        placeholder="Password"
      />

      <button data-testid="login-submit-button" type="submit">
        Login
      </button>

      {error && (
        <p data-testid="login-error">{error}</p>
      )}

      <Link href="/signup" data-testid="signup-link">
        Sign up
      </Link>
    </form>
  );
}
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in UI mode
pnpm test:ui

# Run specific test file
pnpm test tests/login.spec.ts

# Run tests in headed mode (see browser)
pnpm test --headed

# Debug tests
pnpm test --debug
```

## Writing New Tests

1. **Add `data-testid` to components first**: Before writing tests, add appropriate `data-testid` attributes to the components you want to test.

2. **Use descriptive test names**: Test names should clearly describe what is being tested.

3. **Follow AAA pattern**: Arrange, Act, Assert
   ```typescript
   test("should do something", async ({ page }) => {
     // Arrange - set up test data and navigate
     await page.goto("/login");

     // Act - perform the action
     await page.getByTestId("login-button").click();

     // Assert - verify the result
     await expect(page).toHaveURL(/\/dashboard/);
   });
   ```

4. **Use `beforeEach` for common setup**: If multiple tests need the same setup, use `beforeEach`.

5. **Test user flows, not implementation**: Focus on what the user sees and does, not internal state.

## Best Practices

1. ✅ Use `data-testid` for all critical interactions
2. ✅ Write tests from the user's perspective
3. ✅ Test error states and edge cases
4. ✅ Use meaningful test descriptions
5. ✅ Keep tests independent and isolated
6. ❌ Don't rely on CSS selectors or text content for primary selections
7. ❌ Don't test implementation details
8. ❌ Don't create tests that depend on execution order

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Philosophy](https://testing-library.com/docs/guiding-principles/)
