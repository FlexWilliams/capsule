import { expect, test } from '@playwright/test';

/**
 * See: https://playwright.dev/docs/api/class-page#page-get-by-role
 */

test('Document has title "Capsule"', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Capsule/);
});

test('Page has sr-only title: "Capsule"', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Capsule' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Capsule' })).toContainClass('sr-only');
});

test('Page has search form', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('p')).toBeVisible();
	await expect(page.locator('p')).toContainText('Capsule');
	await expect(page.locator('p')).toHaveAttribute('aria-hidden', 'true');
	expect(page.getByRole('form', { name: 'search-podcasts' })).toBeDefined();
});

test('Search form should include search box', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('searchbox', { name: 'search' })).toBeVisible();
	await expect(page.getByRole('searchbox', { name: 'search' })).toHaveValue('');
});

test('Page should have default message', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Try searching for your favorite podcasts!')).toBeVisible();
});
