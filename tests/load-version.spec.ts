import test from './baseFixture';
import { expect } from '@playwright/test';

test('Version QA Tab', async ({ page, materialPo }) => {
  const matDialog = materialPo.matDialog();

  await page.getByRole('link', { name: 'Version QA' }).click();

  await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0);

  await test.step(`Accept version QA`, async () => {
    await page.locator('tbody tr td .fake-link').nth(1).click();
    await page.getByRole('button', { name: 'Accept' }).click();
    await matDialog.waitFor();
    await matDialog.getByPlaceholder('Notes').fill('Accepted by me');
    await matDialog.getByRole('button', { name: 'Save' }).click();
    await matDialog.waitFor({ state: 'hidden' });
    await materialPo.checkAndCloseAlert('Activity added successfully.');
    await expect(page.locator('app-load-version-activity').getByText('Accepted by me')).toBeVisible();
    await expect(page.locator('app-load-version-note').getByText('Accepted by me')).toBeVisible();
  });

  await test.step('Add note', async () => {
    await page.getByRole('button', { name: 'Add Note' }).click();
    for (const [index, tag] of ['Test.Hashtag1', 'Test.Hashtag2', 'New Test Note'].entries()) {
      await page.getByPlaceholder('New Hashtag...').fill(tag);
      await page.keyboard.press('Enter');
      await expect(page.locator('mat-chip-row')).toHaveCount(index + 1);
    }

    await page.locator('mat-dialog-content textarea').fill('New Test Note');
    await page.getByRole('button', { name: 'Save' }).click();
    await materialPo.checkAndCloseAlert('Note added successfully.');
    await expect(page.locator('app-load-version-note').getByText('#Test.Hashtag2')).toBeVisible();
  });

  await test.step(`Open QA Report page`, async () => {
    const [qaReportPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('link', { name: 'Go to QA Report' }).click(),
    ]);

    await expect(qaReportPage).toHaveTitle(`Version QA Report`);
  });
});
