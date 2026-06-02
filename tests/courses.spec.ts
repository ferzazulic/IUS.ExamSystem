import { test, expect } from '@playwright/test';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5173';


test.describe('Courses CRUD (client-side)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/courses`);

    await page.evaluate(() => localStorage.removeItem('courses'));
    await page.reload();
  });



  test('create a course via Add button', async ({ page }) => {
    const name = 'Introduction to Testing';
    await page.getByPlaceholder('Course name').fill(name);
    await page.getByRole('button', { name: '+ Add' }).click();

    await expect(page.getByText(name)).toBeVisible();
  });




  test('create a course by pressing Enter', async ({ page }) => {
    const name = 'Data Structures';
    const input = page.getByPlaceholder('Course name');
    await input.fill(name);
    await input.press('Enter');

    await expect(page.getByText(name)).toBeVisible();
  });




  test('create multiple courses and read the list', async ({ page }) => {
    const courses = ['Algo 101', 'Networks', 'Databases'];
    for (const c of courses) {
      await page.getByPlaceholder('Course name').fill(c);
      await page.getByRole('button', { name: '+ Add' }).click();
    }

    for (const c of courses) {
      await expect(page.getByText(c)).toBeVisible();
    }
  });





  test('delete a course from the list', async ({ page }) => {
    const name = 'Temporary Course';
    await page.getByPlaceholder('Course name').fill(name);
    await page.getByRole('button', { name: '+ Add' }).click();
    await expect(page.getByText(name)).toBeVisible();

    
    const courseItem = page.getByText(name).locator('..');
    await courseItem.getByRole('button', { name: 'Delete' }).click();

    
    await expect(page.getByText(name)).toHaveCount(0);
  });

  

  test('shows friendly empty state when no courses exist', async ({ page }) => {
    
    await expect(page.getByText('No courses yet.')).toBeVisible();
  });

  test('input validation: whitespace-only input does not add a course', async ({ page }) => {
    await page.getByPlaceholder('Course name').fill('   ');
    await page.getByRole('button', { name: '+ Add' }).click();
    
    await expect(page.getByText('No courses yet.')).toBeVisible();
  });



  test('cross-navigation persistence: back returns to Courses page', async ({ page }) => {
    const name = 'Persistent Course';
    await page.getByPlaceholder('Course name').fill(name);
    await page.getByRole('button', { name: '+ Add' }).click();
    await expect(page.getByText(name)).toBeVisible();

    
    await page.getByText('Rooms').click();
    await expect(page.getByRole('heading', { name: 'Rooms', exact: true })).toBeVisible();

    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Courses', exact: true })).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();
  });
  });
  
