import { test, expect } from '@playwright/test';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5173';

test('shows login page by default', async ({ page }) => {
  await page.goto(BASE);

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in with Azure ID' })).toBeVisible();
});

test('validates required login fields', async ({ page }) => {
  await page.goto(`${BASE}/login`);

  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByText('Email and password are required')).toBeVisible();
});

test('offers Azure ID sign in from login page', async ({ page }) => {
  await page.goto(`${BASE}/login`);

  const azureLogin = page.getByRole('link', { name: 'Sign in with Azure ID' });
  await expect(azureLogin).toBeVisible();
  await expect(azureLogin).toHaveAttribute('href', /\/api\/Auth\/azure-login$/);
});
