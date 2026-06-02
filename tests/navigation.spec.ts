import { test, expect } from '@playwright/test';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5173';

test.describe('Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(BASE);
		await page.evaluate(() => localStorage.clear());
	});



	test('direct route to Courses shows header', async ({ page }) => {
		await page.goto(`${BASE}/courses`);
		await expect(page.getByRole('heading', { name: 'Courses', exact: true })).toBeVisible();
	});




	test('sidebar navigation', async ({ page }) => {
		await page.goto(`${BASE}/courses`);
		await page.evaluate(() => localStorage.setItem('fullName', 'Test User'));

		await page.getByText('Rooms').click();
		await expect(page.getByRole('heading', { name: 'Rooms', exact: true })).toBeVisible();
	});

	test('direct route to Exams shows header', async ({ page }) => {
		await page.goto(`${BASE}/exams`);
		await expect(page.getByRole('heading', { name: 'Exams Management', exact: true })).toBeVisible();
	});
});

