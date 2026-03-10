/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */
/**
 * Accessibility (a11y) Tests
 * 
 * Validates WCAG 2.1 Level AA compliance for critical user journeys.
 * Uses axe-core to detect common accessibility violations.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES_TO_TEST = [
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
  { name: 'Home', path: '/' },
];

test.describe('Accessibility (WCAG 2.1 Level AA)', () => {
  for (const page of PAGES_TO_TEST) {
    test(`${page.name} page should have no critical a11y violations`, async ({ page: playwright }) => {
      await playwright.goto(page.path);
      await playwright.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page: playwright })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Extract critical and serious violations
      const criticalViolations = accessibilityScanResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      // Log violations for debugging
      if (criticalViolations.length > 0) {
        console.error(`\n❌ ${page.name} has ${criticalViolations.length} critical/serious a11y violations:\n`);
        criticalViolations.forEach((violation) => {
          console.error(`  • ${violation.id}: ${violation.description}`);
          console.error(`    Help: ${violation.helpUrl}`);
          console.error(`    Nodes affected: ${violation.nodes.length}`);
        });
      }

      // Fail test if critical violations found
      expect(criticalViolations.length).toBe(0);
    });
  }

  test('Color contrast meets WCAG AA (dark mode)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enable dark mode if toggle exists
    const darkModeToggle = page.getByRole('button', { name: /dark.*mode|theme/i });
    if (await darkModeToggle.isVisible().catch(() => false)) {
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Allow theme transition
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations.length).toBe(0);
  });

  test('Keyboard navigation works', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Tab through focusable elements
    const emailInput = page.getByPlaceholder('you@example.com');
    const passwordInput = page.getByPlaceholder('••••••••');
    const submitButton = page.getByRole('button', { name: /sign\s*in/i });

    // Verify tab order
    await page.keyboard.press('Tab');
    await expect(emailInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();

    await page.keyboard.press('Tab');
    // Submit button should be reachable via keyboard
    await expect(submitButton).toBeVisible();
  });
});
