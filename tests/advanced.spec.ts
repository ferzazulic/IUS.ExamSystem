import { test, expect } from '@playwright/test';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5173';



test.describe('Advanced Courses Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/courses`);

    await page.evaluate(() => localStorage.removeItem('courses'));
    await page.reload();
  });




  test('duplicate course names: adding two courses with the same name', async ({ page }) => {
    const name = 'Math';
    
    await page.getByPlaceholder('Course name').fill(name);
    await page.getByRole('button', { name: '+ Add' }).click();
    

    await page.getByPlaceholder('Course name').fill(name);
    await page.getByRole('button', { name: '+ Add' }).click();


    const mathEntries = page.getByText(name);
    await expect(mathEntries).toHaveCount(2);
  });





  test('long string overflow: adding a 200+ character course name', async ({ page }) => {
    const longName = 'A'.repeat(250);

    await page.getByPlaceholder('Course name').fill(longName);
    await page.getByRole('button', { name: '+ Add' }).click();

    const courseContainer = page.getByTestId('course-item').first();
    await expect(courseContainer).toBeVisible();

    
    const deleteButton = courseContainer.getByRole('button', { name: 'Delete' });
    await expect(deleteButton).toBeVisible();
  });





  test('mass addition: add 20 courses rapidly and verify UI stability', async ({ page }) => {
    test.setTimeout(60000);
    const courseCount = 20;
    const input = page.getByPlaceholder('Course name');
    const addButton = page.getByRole('button', { name: '+ Add' });

    await expect(input).toBeVisible();

    for (let i = 1; i <= courseCount; i++) {
      const courseName = `Course ${i}`;
      await input.fill(courseName);
      await addButton.click();
    }

    const courseItems = page.getByTestId('course-item');
    await expect(courseItems).toHaveCount(courseCount, { timeout: 10000 });

    const lastCourseContainer = courseItems.last();
    const deleteButton = lastCourseContainer.getByRole('button', { name: 'Delete' });

    await lastCourseContainer.scrollIntoViewIfNeeded();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    await expect(courseItems).toHaveCount(courseCount - 1, { timeout: 10000 });
  });
});
